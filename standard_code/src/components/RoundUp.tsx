
import React, { useEffect, useState } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const RoundUp: React.FC = () => {
  const { continueGame, score, resetGame } = useTrivia();
  const navigate = useNavigate();
  const location = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(20);
  
  // Check if we came from the challenge mode
  const isFromChallenge = location.state?.fromChallenge || false;

  useEffect(() => {
    // Timer to countdown from 20 seconds
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // When timer runs out, handle based on score
          handleExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up timer on unmount
    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    continueGame();
    
    // If coming from challenge mode, navigate back to flappy challenge game
    if (isFromChallenge) {
      navigate('/flappy');
    } else {
      // Otherwise, go to categories for standard mode
      navigate('/categories');
    }
  };

  const handleExit = () => {
    // Store score before resetting
    const finalScore = score;
    resetGame();
    
    // If score is 0, go directly to home page
    if (finalScore <= 0) {
      navigate('/');
    } else {
      // Otherwise, go to candy selection
      navigate('/selection', { state: { finalScore } });
    }
  };

  // Format time as MM:SS for the timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = (secondsLeft / 20) * 100;

  return (
    <div className="flex flex-col h-screen items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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
      
      {/* Main content */}
      <div className="z-10 w-full max-w-4xl mx-auto p-4 text-center">
        {/* Timer and Score row */}
        <div className="flex justify-between items-center w-full mb-2 font-mono text-black">
          <div className="text-4xl font-bold">
            {formatTime(secondsLeft)} left to decide
          </div>
          <div className="text-4xl font-bold">
            Score: + {score}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full mb-6">
          <Progress value={progressPercentage} className="h-2 bg-white/30" />
        </div>
        
        {/* Time is up heading */}
        <h1 className="text-6xl font-mono mb-6 pixel-text-lg"
            style={{ 
              textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff'
            }}>
          Time is up! Round Over :(
        </h1>
        
        {/* Choose one of the options - smaller to fit on one line with emoji */}
        <h2 className="text-2xl font-mono mb-8 pixel-text-lg flex items-center justify-center">
          <span>Choose one of the options</span><span className="ml-2">🦑</span>
        </h2>
        
        {/* Buttons - longer horizontally and thinner vertically */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-yellow-300 rounded-xl p-3 border-4 border-white mx-auto w-80 h-28">
            <Button
              onClick={handleContinue}
              className="w-full h-full bg-transparent hover:bg-transparent text-green-800 border-none shadow-none text-5xl font-mono flex flex-col items-center"
            >
              <span>Continue?</span>
              <span className="text-xl mt-2 font-mono">(Your points won't go away)</span>
            </Button>
          </div>
          
          <div className="bg-yellow-300 rounded-xl p-3 border-4 border-white mx-auto w-80 h-28">
            <Button
              onClick={handleExit}
              className="w-full h-full bg-transparent hover:bg-transparent text-red-600 border-none shadow-none text-5xl font-mono"
            >
              Exit?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundUp;
