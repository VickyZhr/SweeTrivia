
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Question {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface TriviaContextType {
  totalQuestions: number;
  setTotalQuestions: (count: number) => void;
  questions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  getQuestionById: (id: number) => Question | undefined;
  exportToCSV: () => string;
}

const TriviaContext = createContext<TriviaContextType | undefined>(undefined);

export const TriviaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (question: Question) => {
    setQuestions((prev) => [...prev, question]);
  };

  const updateQuestion = (question: Question) => {
    setQuestions((prev) => 
      prev.map((q) => (q.id === question.id ? question : q))
    );
  };

  const getQuestionById = (id: number) => {
    return questions.find((q) => q.id === id);
  };

  const exportToCSV = () => {
    const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
    const rows = questions.map(q => [
      q.text,
      q.optionA,
      q.optionB,
      q.optionC,
      q.optionD,
      q.correctAnswer
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  return (
    <TriviaContext.Provider
      value={{
        totalQuestions,
        setTotalQuestions,
        questions,
        addQuestion,
        updateQuestion,
        getQuestionById,
        exportToCSV
      }}
    >
      {children}
    </TriviaContext.Provider>
  );
};

export const useTrivia = () => {
  const context = useContext(TriviaContext);
  if (context === undefined) {
    throw new Error('useTrivia must be used within a TriviaProvider');
  }
  return context;
};
