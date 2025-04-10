
import React from 'react';
import { getOptionLetter } from '@/utils/triviaUtils';
import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean | null;
  disabled: boolean;
  onSelect: () => void;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  index,
  selected,
  correct,
  disabled,
  onSelect,
}) => {
  const getOptionClass = () => {
    if (correct === true) return 'bg-green-400 border-white';
    if (correct === false) return 'bg-red-400 border-white';
    if (selected) return 'border-white bg-yellow-300/90';
    return 'bg-yellow-300 hover:bg-yellow-300/90 border-white';
  };

  const getStatusIcon = () => {
    if (correct === true) return <Check className="h-5 w-5 text-white" />;
    if (correct === false && selected) return <X className="h-5 w-5 text-white" />;
    return null;
  };

  return (
    <button
      className={`w-full py-4 px-5 rounded-full border-4 flex justify-between items-center ${getOptionClass()}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="font-game-text font-bold text-2xl text-left text-green-800">
        {getOptionLetter(index)}. {option}
      </span>
      {getStatusIcon()}
    </button>
  );
};

export default AnswerOption;
