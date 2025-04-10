
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  score: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, score }) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div className="text-black font-mono text-4xl font-bold">
        {formatTime(timeLeft)}
      </div>
      <div className="text-black font-mono text-4xl font-bold">
        Score: + {score}
      </div>
    </div>
  );
};

export default TimerDisplay;
