
import React from 'react';
import { Question } from '@/utils/flappyGameUtils';

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div className="text-white bg-black/50 backdrop-blur-sm p-4 rounded-lg max-w-xs">
      <h3 className="font-bold mb-2">{question.question}</h3>
      <ul className="list-disc pl-5">
        {question.options.map((option, index) => (
          <li key={index}>
            {String.fromCharCode(65 + index)}. {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionDisplay;
