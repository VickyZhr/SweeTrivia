
import React from 'react';
import { useTrivia } from '@/context/TriviaContext';
import TriviaCard from '@/components/TriviaCard';
import ResultScreen from '@/components/ResultScreen';
import ScoreDisplay from '@/components/ScoreDisplay';
import TimeUpScreen from '@/components/TimeUpScreen';

const TriviaGame: React.FC = () => {
  const { 
    currentQuestion, 
    score, 
    totalQuestions, 
    isGameOver,
    isTimeUp
  } = useTrivia();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pink-500 relative overflow-hidden">
      
      <div className="w-full max-w-4xl mx-auto z-10">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800 font-mono text-shadow">SweeTrivia</h1>
          {!isGameOver && !isTimeUp && currentQuestion && (
            <div className="flex items-center">
              <ScoreDisplay score={score} total={totalQuestions} />
            </div>
          )}
        </header>
        
        <div className="relative mb-8">
          {isTimeUp ? (
            <TimeUpScreen />
          ) : isGameOver ? (
            <ResultScreen />
          ) : currentQuestion ? (
            <TriviaCard question={currentQuestion} />
          ) : (
            <div className="text-center p-8 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Waiting for game to start</h2>
              <div className="animate-pulse-soft">🍬 🍭 🍫</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;
