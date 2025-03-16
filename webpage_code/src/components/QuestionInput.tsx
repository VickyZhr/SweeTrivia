
import React from 'react';
import { cn } from '@/lib/utils';

interface QuestionInputProps {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  onQuestionChange: (value: string) => void;
  onOptionAChange: (value: string) => void;
  onOptionBChange: (value: string) => void;
  onOptionCChange: (value: string) => void;
  onOptionDChange: (value: string) => void;
  onCorrectAnswerChange: (value: string) => void;
  className?: string;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  optionA,
  optionB,
  optionC,
  optionD,
  correctAnswer,
  onQuestionChange,
  onOptionAChange,
  onOptionBChange,
  onOptionCChange,
  onOptionDChange,
  onCorrectAnswerChange,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-white/80 mb-2">
          Question:
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className="input-field"
          placeholder="Enter your question here"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="optionA" className="block text-sm font-medium text-white/80 mb-2">
            Option A:
          </label>
          <input
            id="optionA"
            type="text"
            value={optionA}
            onChange={(e) => onOptionAChange(e.target.value)}
            className="input-field"
            placeholder="Option A"
          />
        </div>

        <div>
          <label htmlFor="optionB" className="block text-sm font-medium text-white/80 mb-2">
            Option B:
          </label>
          <input
            id="optionB"
            type="text"
            value={optionB}
            onChange={(e) => onOptionBChange(e.target.value)}
            className="input-field"
            placeholder="Option B"
          />
        </div>

        <div>
          <label htmlFor="optionC" className="block text-sm font-medium text-white/80 mb-2">
            Option C:
          </label>
          <input
            id="optionC"
            type="text"
            value={optionC}
            onChange={(e) => onOptionCChange(e.target.value)}
            className="input-field"
            placeholder="Option C"
          />
        </div>

        <div>
          <label htmlFor="optionD" className="block text-sm font-medium text-white/80 mb-2">
            Option D:
          </label>
          <input
            id="optionD"
            type="text"
            value={optionD}
            onChange={(e) => onOptionDChange(e.target.value)}
            className="input-field"
            placeholder="Option D"
          />
        </div>
      </div>

      <div>
        <label htmlFor="correctAnswer" className="block text-sm font-medium text-white/80 mb-2">
          Correct Answer:
        </label>
        <select
          id="correctAnswer"
          value={correctAnswer}
          onChange={(e) => onCorrectAnswerChange(e.target.value)}
          className="input-field"
        >
          <option value="">Select correct answer</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
    </div>
  );
};

export default QuestionInput;
