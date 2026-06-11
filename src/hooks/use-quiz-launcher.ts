import { useCallback, useState } from "react";
import { QUIZ_OPENED_EVENT, HAS_CLICKED_QUOTE_KEY } from "@/constants/quiz";
import { safeSessionSet } from "@/lib/safeStorage";

export function useQuizLauncher() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const openQuiz = useCallback(() => {
    window.dispatchEvent(new CustomEvent(QUIZ_OPENED_EVENT));
    safeSessionSet(HAS_CLICKED_QUOTE_KEY, '1');
    setIsQuizOpen(true);
  }, []);

  const closeQuiz = useCallback(() => setIsQuizOpen(false), []);

  return { isQuizOpen, openQuiz, closeQuiz };
}
