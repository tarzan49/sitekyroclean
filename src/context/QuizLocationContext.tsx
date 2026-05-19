import { createContext, useContext } from "react";

const QuizLocationContext = createContext<string | undefined>(undefined);

export const QuizLocationProvider = QuizLocationContext.Provider;
export const useQuizLocation = () => useContext(QuizLocationContext);
