import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TriviaQuestion, shuffleArray } from '@/utils/triviaUtils';
import { toast } from '@/components/ui/use-toast';

interface TriviaContextType {
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  totalQuestions: number;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  isGameOver: boolean;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  timeLeft: number;
  timeUp: boolean;
  setTimeUp: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  goToNextQuestion: () => void;
  selectAnswer: (answer: string) => void;
  resetGame: () => void;
  stopGame: () => void;
  currentQuestion: TriviaQuestion | null;
  filterQuestionsByCategory: (category: string | null) => void;
  selectedCategory: string | null;
  continueGame: () => void;
  updateScore: (additionalScore: number) => void;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    fetch('/data/questions_and_choices.json')
      .then((res) => res.json())
      .then((jsonData) => {
        console.log('✅ Loaded JSON questions:', jsonData);
        setAllQuestions(shuffleArray(jsonData));

        if (selectedCategory) {
          filterQuestionsByCategory(selectedCategory);
        } else {
          setQuestions(shuffleArray(jsonData));
        }
      })
      .catch((error) => {
        console.error('❌ Failed to load questions_and_choices.json', error);
        setAllQuestions([]);
        setQuestions([]);
      });
  }, []);

  const updateScore = (additionalScore: number) => {
    setScore(additionalScore);
  };

  const loadQuestions = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setAllQuestions(shuffleArray(parsed));
  
      if (selectedCategory) {
        filterQuestionsByCategory(selectedCategory);
      } else {
        setQuestions(shuffleArray(parsed));
      }
  
      console.log("✅ Fully reloaded updated JSON question set.");
    } catch (error) {
      console.error("❌ Failed to load questions from cloud JSON:", error);
    }
  };
  
  
  const continueGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsGameOver(false);
    setTimeUp(false);
    setTimeLeft(10);
  };

  const filterQuestionsByCategory = (category: string | null) => {
    setSelectedCategory(category);

    if (!category) {
      setQuestions(shuffleArray([...allQuestions]));
    } else {
      const filteredQuestions = allQuestions.filter((q) => q.category === category);

      console.log('Filtered questions:', filteredQuestions);

      if (filteredQuestions.length === 0) {
        toast({
          title: 'No questions found for this category',
          description: 'Using a mix of categories instead',
          variant: 'destructive',
        });
        setQuestions(shuffleArray([...allQuestions]));
      } else {
        setQuestions(shuffleArray(filteredQuestions));
      }
    }

    continueGame();
  };

  const selectAnswer = (answer: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      setScore((prevScore) => prevScore + 10);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsGameOver(false);
    setTimeUp(false);
    setTimeLeft(10);
  };

  const stopGame = () => {
    if (!timeUp) {
      setIsGameOver(true);
    }
  };

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const totalQuestions = questions.length;

  const value = {
    questions,
    currentQuestionIndex,
    score,
    setScore,
    totalQuestions,
    selectedAnswer,
    hasAnswered,
    isGameOver,
    setIsGameOver,
    timeLeft,
    timeUp,
    setTimeUp,
    setTimeLeft,
    goToNextQuestion,
    selectAnswer,
    resetGame,
    stopGame,
    currentQuestion,
    filterQuestionsByCategory,
    selectedCategory,
    continueGame,
    updateScore,
    loadQuestions,
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