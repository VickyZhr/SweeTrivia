
import React from 'react';
import { getOptionLetter } from '@/utils/triviaUtils';

interface TriviaOptionsProps {
  options: string[];
  hasAnswered: boolean;
  isNarrating: boolean;
  narrationFailed: boolean;
  selectedAnswer: string | null;
  correctAnswer: string;
  onSelectAnswer: (answer: string) => void;
}

const TriviaOptions: React.FC<TriviaOptionsProps> = ({
  options,
  hasAnswered,
  isNarrating,
  narrationFailed,
  selectedAnswer,
  correctAnswer,
  onSelectAnswer,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !hasAnswered && (!isNarrating || narrationFailed) && onSelectAnswer(option)}
          disabled={hasAnswered || (isNarrating && !narrationFailed)}
          className={`
            w-full py-5 px-6 rounded-full border-4 border-white
            font-mono text-2xl font-bold text-center
            ${hasAnswered && option === correctAnswer 
              ? 'bg-green-400' 
              : hasAnswered && selectedAnswer === option && option !== correctAnswer
                ? 'bg-red-400'
                : selectedAnswer === option
                  ? 'bg-yellow-300/90'
                  : isNarrating && !narrationFailed
                    ? 'bg-yellow-300/50 cursor-not-allowed'
                    : 'bg-yellow-300 hover:bg-yellow-300/90'}
            transition-all duration-300
          `}
        >
          <span className="block">{getOptionLetter(index)}. {option}</span>
        </button>
      ))}
    </div>
  );
};

export default TriviaOptions;
