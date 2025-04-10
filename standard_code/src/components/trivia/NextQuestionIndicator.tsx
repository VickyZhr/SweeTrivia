
import React from 'react';

interface NextQuestionIndicatorProps {
  visible: boolean;
  countdown: number; // Add countdown prop to show exact seconds remaining
}

const NextQuestionIndicator: React.FC<NextQuestionIndicatorProps> = ({ visible, countdown }) => {
  if (!visible) return null;
  
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="bg-yellow-300/80 text-green-800 px-6 py-3 rounded-xl font-bold animate-pulse text-2xl md:text-3xl">
        Next question in {countdown} second{countdown !== 1 ? 's' : ''}...
      </div>
    </div>
  );
};

export default NextQuestionIndicator;
