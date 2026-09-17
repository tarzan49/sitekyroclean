import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useQuizAnalytics } from './use-quiz-analytics';
const events=vi.hoisted(()=>vi.fn());
vi.mock('@/lib/quizTracking',()=>({trackQuizEvent:events}));
vi.mock('@/lib/analytics',()=>({trackEvent:vi.fn()}));
const setVisibility=(state:'visible'|'hidden')=>{Object.defineProperty(document,'visibilityState',{value:state,configurable:true});act(()=>{document.dispatchEvent(new Event('visibilitychange'));});};
const abandons=()=>events.mock.calls.filter(([e])=>e.action==='abandon').map(([e])=>e.step);
afterEach(()=>{cleanup();events.mockClear();setVisibility('visible');});
const initial={isOpen:true,currentStep:0,totalSteps:4,service:'sofa',totalValue:89};
describe('quiz attempts',()=>{
  it('tracks direct transitions, revisits once, and submits only on explicit success',()=>{
    const {rerender,result}=renderHook(p=>useQuizAnalytics(p),{initialProps:initial,wrapper:StrictMode});
    rerender({...initial,currentStep:1});rerender({...initial,currentStep:3});rerender({...initial,currentStep:1});rerender({...initial,currentStep:4});
    expect(events.mock.calls.filter(([e])=>e.action==='start').map(([e])=>e.step)).toEqual([-1,0,1,3,4]);
    expect(events.mock.calls.filter(([e])=>e.action==='complete')).toHaveLength(0);
    act(()=>{result.current.trackSubmission();result.current.trackSubmission();});
    expect(events.mock.calls.filter(([e])=>e.action==='complete')).toHaveLength(1);
    rerender({...initial,isOpen:false});
    expect(abandons()).toHaveLength(0);
  });
  it('tracks abandonment at contact and starts a separate attempt when reopened',()=>{
    const {rerender}=renderHook(p=>useQuizAnalytics(p),{initialProps:initial});
    rerender({...initial,currentStep:4});rerender({...initial,currentStep:0,isOpen:false});rerender(initial);
    const starts=events.mock.calls.filter(([e])=>e.step===-1);
    expect(starts).toHaveLength(2);expect(starts[0][0].session_id).not.toBe(starts[1][0].session_id);
    expect(abandons()).toEqual([4]);
  });
  // A maioria das saídas nunca passa pelo botão de fechar: o separador vai
  // para segundo plano (telemóvel), fecha-se, ou a pessoa carrega em voltar.
  it('reports the step reached when the tab is hidden, closed or navigated back',()=>{
    const {rerender}=renderHook(p=>useQuizAnalytics(p),{initialProps:initial});
    rerender({...initial,currentStep:2});
    setVisibility('hidden');
    expect(abandons()).toEqual([2]);
    // Voltar e sair outra vez no mesmo passo não duplica a linha.
    setVisibility('visible');setVisibility('hidden');
    expect(abandons()).toEqual([2]);
    // Avançar e sair outra vez reporta o passo novo, para o último ficar a valer.
    setVisibility('visible');rerender({...initial,currentStep:3});
    act(()=>{window.dispatchEvent(new Event('pagehide'));});
    expect(abandons()).toEqual([2,3]);
    rerender({...initial,currentStep:4});
    act(()=>{window.dispatchEvent(new PopStateEvent('popstate'));});
    expect(abandons()).toEqual([2,3,4]);
    // Fechar no X a seguir, no mesmo passo já reportado, não duplica a linha.
    rerender({...initial,currentStep:4,isOpen:false});
    expect(abandons()).toEqual([2,3,4]);
  });
  it('never reports a completed attempt as abandoned when the tab is hidden',()=>{
    const {result}=renderHook(p=>useQuizAnalytics(p),{initialProps:initial});
    act(()=>{result.current.trackSubmission();});
    setVisibility('hidden');
    act(()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new PopStateEvent('popstate'));});
    expect(abandons()).toHaveLength(0);
  });
  it('ignores page-level signals when no quiz attempt is open',()=>{
    renderHook(p=>useQuizAnalytics(p),{initialProps:{...initial,isOpen:false}});
    setVisibility('hidden');
    act(()=>{window.dispatchEvent(new PopStateEvent('popstate'));});
    expect(events).not.toHaveBeenCalled();
  });
});
