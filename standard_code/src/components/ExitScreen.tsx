import React, { useEffect, useRef } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Candy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ExitScreen: React.FC = () => {
  const { score, resetGame } = useTrivia();
  const navigate = useNavigate();
  const location = useLocation();

  const candyAudioRef = useRef<HTMLAudioElement>(null);
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
        candyAudioRef.current?.play().catch(err => {
          console.warn("Audio error:", err);
        });
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
      candyAudioRef.current?.play().catch(err => {
        console.warn("Audio error:", err);
      });
      navigate('/selection', { state: { finalScore } });
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
      <audio ref={candyAudioRef} src="/sounds/candy_selection_page_cleaned.mp3" preload="auto" />
      <div className="absolute top-5 w-[95%] mx-auto">
        <img src="/lovable-uploads/92149b53-6c92-4ab5-b43e-94cf49eea917.png" alt="Top shapes" className="w-full" />
      </div>
      <div className="absolute bottom-0 w-[95%] mx-auto">
        <img src="/lovable-uploads/f4358604-0ca8-4f42-b36a-1c87c99ef22d.png" alt="Bottom shapes" className="w-full" />
      </div>

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
            <Button onClick={handleContinue} className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-2xl py-8 px-12 rounded-full">
              Continue Challenge
            </Button>
            <Button onClick={handleExit} className="bg-yellow-300 hover:bg-yellow-400 text-red-600 font-bold text-2xl py-8 px-12 rounded-full">
              Exit & Get Candy
            </Button>
          </div>
        ) : (
          <Button onClick={handleContinue} className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-2xl py-8 px-12 rounded-full">
            Tap to continue!
          </Button>
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
