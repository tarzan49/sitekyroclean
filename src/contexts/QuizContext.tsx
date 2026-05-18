import { createContext, useContext, useState, ReactNode } from 'react';

interface QuizContextType {
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <QuizContext.Provider value={{ isQuizOpen, setIsQuizOpen }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
