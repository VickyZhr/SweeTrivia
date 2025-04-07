
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
  onSelect
}) => {
  const getOptionClass = () => {
    if (correct === true) return 'bg-green-400 border-white';
    if (correct === false && selected) return 'bg-red-400 border-white';
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
      className={`w-full py-3 px-4 rounded-full border-4 flex items-center 
        justify-between ${getOptionClass()} shadow-md transition-all font-mono
        duration-300 ${disabled ? 'cursor-default' : 'cursor-pointer'} text-lg font-bold`}
      onClick={onSelect}
      disabled={disabled}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center">
        <span className="font-mono font-bold mr-3 text-lg">
          {getOptionLetter(index)}.
        </span>
        <span className="text-left font-bold">{option}</span>
      </div>
      {getStatusIcon()}
    </button>
  );
};

export default AnswerOption;
