import React, { useEffect } from 'react';
import { TriviaQuestion } from '@/utils/triviaUtils';
import AnswerOption from './AnswerOption';
import CategoryBadge from './CategoryBadge';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import AudioNarrator from './AudioNarrator';
import TimeUpScreen from './TimeUpScreen';

interface TriviaCardProps {
  question: TriviaQuestion;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ question }) => {
  const { 
    selectedAnswer, 
    selectAnswer, 
    hasAnswered,
    goToNextQuestion,
    currentQuestionIndex,
    totalQuestions,
    score,
    timeLeft,
    setTimeLeft,
    isNarrating,
    isGameOver
  } = useTrivia();
  
  useEffect(() => {
    // Only countdown if:
    // 1. Not narrating (timer pauses during narration)
    // 2. User hasn't answered current question
    // 3. There's still time left
    // 4. Game isn't over
    if (!isNarrating && !hasAnswered && timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Auto-select an empty answer when time runs out
            selectAnswer('');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Clear timer if component unmounts or conditions change
      return () => clearInterval(timer);
    }
  }, [isNarrating, hasAnswered, timeLeft, isGameOver, selectAnswer, setTimeLeft]);

  // Add a new effect to automatically advance to the next question after answer selection
  // BUT only if the user actually selected an answer (not when time runs out)
  useEffect(() => {
    if (hasAnswered && selectedAnswer !== '') {
      // Set a timeout to automatically move to the next question after 2 seconds
      const autoAdvanceTimer = setTimeout(() => {
        goToNextQuestion();
      }, 2000);
      
      // Clear the timer if component unmounts
      return () => clearTimeout(autoAdvanceTimer);
    }
  }, [hasAnswered, goToNextQuestion, selectedAnswer]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show the TimeUpScreen when time is up and user hasn't selected a valid answer
  if (timeLeft === 0 && hasAnswered && selectedAnswer === '') {
    return <TimeUpScreen />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Include the AudioNarrator component */}
      <AudioNarrator question={question} />
      
      <div className="mb-6 flex justify-between items-center">
        <div className={`text-black font-mono text-3xl font-bold ${timeLeft <= 3 && !hasAnswered && !isNarrating ? 'text-red-600 animate-pulse' : ''}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-black font-mono text-3xl font-bold">
          Score: {score}
        </div>
      </div>
      
      {/* Display the category */}
      <div className="mb-4">
        <CategoryBadge category={question.category} />
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-green-800 font-mono">
        {question.question}
        <span className="ml-2">🦑</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            option={option}
            index={index}
            selected={selectedAnswer === option}
            correct={hasAnswered ? option === question.correctAnswer : null}
            disabled={hasAnswered || isNarrating}
            onSelect={() => selectAnswer(option)}
          />
        ))}
      </div>
      
      {hasAnswered && selectedAnswer !== '' && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-yellow-300/80 text-green-800 px-4 py-2 rounded-xl font-bold animate-pulse">
            {currentQuestionIndex < totalQuestions - 1 ? (
              'Next question in 2 seconds...'
            ) : (
              'Loading results in 2 seconds...'
            )}
          </div>
        </div>
      )}
      
      {isNarrating && (
        <div className="fixed bottom-4 right-4 bg-yellow-300 text-green-800 px-4 py-2 rounded-xl font-bold animate-pulse">
          Narrating...
        </div>
      )}
    </div>
  );
};

export default TriviaCard;
