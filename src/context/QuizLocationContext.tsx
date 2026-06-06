import { createContext, useContext } from "react";

const QuizLocationContext = createContext<string | undefined>(undefined);
export const QuizLocationProvider = QuizLocationContext.Provider;
export const useQuizLocation = () => useContext(QuizLocationContext);

const QuizServiceContext = createContext<string | undefined>(undefined);
export const QuizServiceProvider = QuizServiceContext.Provider;
export const useQuizService = () => useContext(QuizServiceContext);
