
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TriviaQuestion, parseCSV, shuffleArray, sampleTriviaData } from '@/utils/triviaUtils';
import { toast } from '@/components/ui/use-toast';

interface TriviaContextType {
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  isGameOver: boolean;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isNarrating: boolean;
  setIsNarrating: React.Dispatch<React.SetStateAction<boolean>>;
  loadQuestions: (csvData?: string) => void;
  goToNextQuestion: () => void;
  selectAnswer: (answer: string) => void;
  resetGame: () => void;
  stopGame: () => void;
  currentQuestion: TriviaQuestion | null;
  filterQuestionsByCategory: (category: string | null) => void;
  selectedCategory: string | null;
  continueGame: () => void;
  isTimeUp: boolean;
  setIsTimeUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const TriviaContext = createContext<TriviaContextType | undefined>(undefined);

export const TriviaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allQuestions, setAllQuestions] = useState<TriviaQuestion[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    try {
      loadQuestions();
    } catch (error) {
      console.error("Error loading initial questions:", error);
      setAllQuestions([]);
      setQuestions([]);
    }
  }, []);

  const loadQuestions = (csvData: string = sampleTriviaData) => {
    try {
      const parsedQuestions = parseCSV(csvData);
      setAllQuestions(shuffleArray(parsedQuestions));
      // If we have a selected category, apply it
      if (selectedCategory) {
        filterQuestionsByCategory(selectedCategory);
      } else {
        setQuestions(shuffleArray(parsedQuestions));
      }
      resetGame();
    } catch (error) {
      console.error("Error in loadQuestions:", error);
      throw error;
    }
  };

  // New function to continue the game without resetting the score
  const continueGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsGameOver(false);
    setTimeLeft(10);
    setIsNarrating(true);
    setIsTimeUp(false); // Reset time up state
    // Notice we don't reset the score here
  };

  const filterQuestionsByCategory = (category: string | null) => {
    setSelectedCategory(category);
    
    if (!category) {
      // If no category selected, use all questions (mixed)
      setQuestions(shuffleArray([...allQuestions]));
    } else {
      // Filter questions by selected category
      const filteredQuestions = allQuestions.filter(q => q.category === category);
      
      if (filteredQuestions.length === 0) {
        // If no questions in this category, fallback to all questions
        toast({
          title: "No questions found for this category",
          description: "Using a mix of categories instead",
          variant: "destructive"
        });
        setQuestions(shuffleArray([...allQuestions]));
      } else {
        setQuestions(shuffleArray(filteredQuestions));
      }
    }
    
    // Use continueGame instead of resetGame to preserve score
    continueGame();
  };

  const selectAnswer = (answer: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    // Only add to score if user selected the correct answer (not when time ran out)
    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 10);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setIsTimeUp(false); // Reset time up state
      // Don't reset the timer - we'll continue with the existing time left
      // Only set narrating to true for the next question
      setIsNarrating(true);
    } else {
      // If we reach the end of questions, set isTimeUp instead of isGameOver
      // so the TimeUpScreen shows instead of ResultScreen
      setIsTimeUp(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0); // Reset score only on complete game reset
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsGameOver(false);
    setTimeLeft(10); // Only reset timer when starting a new game
    setIsNarrating(true); // Start with narration for the first question
    setIsTimeUp(false); // Reset time up state
  };

  // Add a new stopGame function that sets isGameOver to true
  const stopGame = () => {
    setIsGameOver(true);
  };

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const totalQuestions = questions.length;

  const value = {
    questions,
    currentQuestionIndex,
    score,
    totalQuestions,
    selectedAnswer,
    hasAnswered,
    isGameOver,
    timeLeft,
    setTimeLeft,
    isNarrating,
    setIsNarrating,
    loadQuestions,
    goToNextQuestion,
    selectAnswer,
    resetGame,
    stopGame,
    currentQuestion,
    filterQuestionsByCategory,
    selectedCategory,
    continueGame,
    isTimeUp,
    setIsTimeUp
  };

  return <TriviaContext.Provider value={value}>{children}</TriviaContext.Provider>;
};

export const useTrivia = (): TriviaContextType => {
  const context = useContext(TriviaContext);
  if (context === undefined) {
    throw new Error('useTrivia must be used within a TriviaProvider');
  }
  return context;
};
