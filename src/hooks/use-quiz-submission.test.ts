import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useQuizSubmission } from './use-quiz-submission';
import type { QuizLeadPayload } from '@/services/submissionService';
const deliver=vi.hoisted(()=>vi.fn());
vi.mock('@/services/submissionService',()=>({submitQuizLead:deliver}));
vi.mock('@/lib/errorTracking',()=>({logError:vi.fn()}));
afterEach(()=>{cleanup();deliver.mockReset();});
const handlers=()=>({trackSubmission:vi.fn(),resetForm:vi.fn(),onClose:vi.fn(),navigate:vi.fn()});
it('does not count or navigate a rejected delivery',async()=>{
  deliver.mockRejectedValue(new Error('Both channels failed'));const h=handlers();
  const {result}=renderHook(()=>useQuizSubmission(h));
  await act(async()=>{expect(await result.current.submit({} as QuizLeadPayload)).toEqual({success:false});});
  expect(h.trackSubmission).not.toHaveBeenCalled();expect(h.navigate).not.toHaveBeenCalled();
});
it('shares an in-flight request and emits success once after delivery',async()=>{
  let resolve!:()=>void;deliver.mockImplementation(()=>new Promise<void>(r=>{resolve=r;}));
  const h=handlers();const {result}=renderHook(()=>useQuizSubmission(h));
  await act(async()=>{
    const first=result.current.submit({} as QuizLeadPayload);const second=result.current.submit({} as QuizLeadPayload);
    expect(first).toBe(second);expect(h.trackSubmission).not.toHaveBeenCalled();resolve();await first;
  });
  expect(deliver).toHaveBeenCalledTimes(1);expect(h.trackSubmission).toHaveBeenCalledTimes(1);expect(h.navigate).toHaveBeenCalledWith('/obrigado');
});
