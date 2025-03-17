
import React from 'react';
import { useTrivia } from '@/context/TriviaContext';
import TriviaCard from '@/components/TriviaCard';
import ResultScreen from '@/components/ResultScreen';
import ScoreDisplay from '@/components/ScoreDisplay';
import TimeUpScreen from '@/components/TimeUpScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TriviaGame: React.FC = () => {
  const { 
    currentQuestion, 
    score, 
    totalQuestions, 
    isGameOver,
    isTimeUp
  } = useTrivia();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
      {/* Top row of shapes */}
      <div className="absolute top-5 w-[95%] mx-auto">
        <img 
          src="/lovable-uploads/92149b53-6c92-4ab5-b43e-94cf49eea917.png" 
          alt="Top shapes" 
          className="w-full"
        />
      </div>
      
      {/* Bottom row of shapes */}
      <div className="absolute bottom-0 w-[95%] mx-auto">
        <img 
          src="/lovable-uploads/f4358604-0ca8-4f42-b36a-1c87c99ef22d.png" 
          alt="Bottom shapes" 
          className="w-full"
        />
      </div>
      
      <div className="w-full max-w-4xl mx-auto z-10">
        <header className="mt-8 mb-8 flex justify-between items-center">
          <h1 className="text-2xl pixel-text-lg tracking-wide">SweeTrivia</h1>
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
              <h2 className="text-xl pixel-text mb-4 tracking-wide">Waiting for game to start</h2>
              <div className="animate-pulse-soft">🍬 🍭 🍫</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Adjusted back button position to match CategorySelect */}
      <Button 
        onClick={handleGoBack}
        variant="yellow"
        className="absolute bottom-44 left-10 text-green-800 font-bold shadow-lg flex items-center z-20"
        size="lg"
      >
        <ArrowLeft className="h-6 w-6 mr-2" /> Go Back
      </Button>
    </div>
  );
};

export default TriviaGame;
