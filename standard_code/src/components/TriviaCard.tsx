
import React, { useEffect } from 'react';
import { TriviaQuestion } from '@/utils/triviaUtils';
import { useTrivia } from '@/context/TriviaContext';
import { getOptionLetter } from '@/utils/triviaUtils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TriviaCardProps {
  question: TriviaQuestion;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ question }) => {
  const { 
    selectedAnswer, 
    selectAnswer, 
    hasAnswered,
    goToNextQuestion,
    score,
    timeLeft,
    setTimeLeft,
    isGameOver,
    timeUp,
    setTimeUp,
  } = useTrivia();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only countdown if:
    // 1. User hasn't answered current question
    // 2. There's still time left
    // 3. Game isn't over
    if (!hasAnswered && timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Auto-select an empty answer when time runs out
            selectAnswer('');
            // Set timeUp to true to show the RoundUp screen
            setTimeUp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Clear timer if component unmounts or conditions change
      return () => clearInterval(timer);
    }
  }, [hasAnswered, timeLeft, isGameOver, selectAnswer, setTimeLeft, setTimeUp]);

  // Add a new effect to automatically advance to the next question after answer selection
  useEffect(() => {
    let autoAdvanceTimer: NodeJS.Timeout | null = null;
    
    if (hasAnswered && selectedAnswer !== null && !timeUp) {
      // Set a timeout to automatically move to the next question after 2 seconds
      autoAdvanceTimer = setTimeout(() => {
        goToNextQuestion();
      }, 2000);
    }
    
    // Clear the timer if component unmounts or conditions change
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [hasAnswered, goToNextQuestion, selectedAnswer, timeUp]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-hot-pink p-6">
        {/* Timer and Score */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-black font-mono text-4xl font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="text-black font-mono text-4xl font-bold">
            Score: + {score}
          </div>
        </div>
        
        {/* Question - Updated with white outline styling similar to Select Category */}
        <h2 className="text-center text-3xl md:text-5xl mb-10 font-mono text-green-800 tracking-wide pixel-text-lg"
            style={{ 
              textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff'
            }}>
          {question.question}
          <span className="ml-2">🦑</span>
        </h2>
        
        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !hasAnswered && selectAnswer(option)}
              disabled={hasAnswered}
              className={`
                w-full py-5 px-6 rounded-full border-4 border-white
                font-mono text-2xl font-bold text-center
                ${hasAnswered && option === question.correctAnswer 
                  ? 'bg-green-400' 
                  : hasAnswered && selectedAnswer === option && option !== question.correctAnswer
                    ? 'bg-red-400'
                    : selectedAnswer === option
                      ? 'bg-yellow-300/90'
                      : 'bg-yellow-300 hover:bg-yellow-300/90'}
                transition-all duration-300
              `}
            >
              <span className="block">{getOptionLetter(index)}. {option}</span>
            </button>
          ))}
        </div>
        
        {hasAnswered && selectedAnswer !== null && (
          <div className="flex justify-center items-center mt-4">
            <div className="bg-yellow-300/80 text-green-800 px-4 py-2 rounded-xl font-bold animate-pulse">
              Next question in 2 seconds...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaCard;
