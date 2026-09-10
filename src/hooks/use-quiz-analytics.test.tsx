import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useQuizAnalytics } from './use-quiz-analytics';
const events=vi.hoisted(()=>vi.fn());
vi.mock('@/lib/quizTracking',()=>({trackQuizEvent:events}));
vi.mock('@/lib/analytics',()=>({trackEvent:vi.fn()}));
afterEach(()=>{cleanup();events.mockClear();});
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
    expect(events.mock.calls.filter(([e])=>e.action==='abandon')).toHaveLength(0);
  });
  it('tracks abandonment at contact and starts a separate attempt when reopened',()=>{
    const {rerender}=renderHook(p=>useQuizAnalytics(p),{initialProps:initial});
    rerender({...initial,currentStep:4});rerender({...initial,currentStep:0,isOpen:false});rerender(initial);
    const starts=events.mock.calls.filter(([e])=>e.step===-1);
    expect(starts).toHaveLength(2);expect(starts[0][0].session_id).not.toBe(starts[1][0].session_id);
    expect(events.mock.calls.filter(([e])=>e.action==='abandon')).toHaveLength(1);
    expect(events.mock.calls.find(([e])=>e.action==='abandon')![0].step).toBe(4);
  });
});
