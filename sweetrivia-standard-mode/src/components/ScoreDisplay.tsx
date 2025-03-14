
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  total: number;
  className?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, total, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-black font-mono font-bold text-3xl">
        Score: <span className="text-black">+ {score}</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
