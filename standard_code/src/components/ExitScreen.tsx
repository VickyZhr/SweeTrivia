import React, { useEffect } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Candy } from 'lucide-react';
import { playSound } from '@/utils/soundUtils';
import { useNavigate, useLocation } from 'react-router-dom';

const ExitScreen: React.FC = () => {
  const { score, resetGame } = useTrivia();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFromChallenge = location.state?.fromChallenge || false;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isFromChallenge) {
      navigate('/flappy');
    } else {
      const finalScore = score;
      resetGame();
      if (finalScore <= 0) {
        navigate('/');
      } else {
        playSound('candy_selection_page.mp3');
        navigate('/selection', { state: { finalScore } });
      }
    }
  };

  const handleExit = () => {
    const finalScore = score;
    resetGame();
    if (finalScore <= 0) {
      navigate('/');
    } else {
      playSound('candy_selection_page.mp3');
      navigate('/selection', { state: { finalScore } });
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
      {/* Decorative elements omitted for brevity */}
      <div className="w-full max-w-2xl z-10 text-center">
        <h1 className="text-3xl font-bold mb-6 pixel-text-lg">You chose to exit the game</h1>
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-2xl font-bold pixel-text">
            You have <span className="italic">{score} points</span>
            {score > 0 ? " to choose your candy" : ""}
          </h2>
          {score > 0 && <Candy className="ml-2 text-red-500 h-8 w-8" />}
        </div>
        {isFromChallenge ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Button onClick={handleContinue} className="...">Continue Challenge</Button>
            <Button onClick={handleExit} className="...">Exit & Get Candy</Button>
          </div>
        ) : (
          <Button onClick={handleContinue} className="...">Tap to continue!</Button>
        )}
        <div className="mt-4 text-white/70 animate-pulse">
          {isFromChallenge 
            ? "Auto-continuing challenge in 10 seconds..." 
            : score > 0 
              ? "Proceeding to candy selection in 10 seconds..." 
              : "Returning to home page in 10 seconds..."}
        </div>
      </div>
    </div>
  );
};

export default ExitScreen;
