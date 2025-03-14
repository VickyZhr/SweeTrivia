
import React, { useEffect, useState } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TimeUpScreen: React.FC = () => {
  const { resetGame, continueGame, score, currentQuestionIndex, totalQuestions, setIsTimeUp } = useTrivia();
  const [decisionTimeLeft, setDecisionTimeLeft] = useState(10);
  const navigate = useNavigate();

  // Countdown timer for the decision
  useEffect(() => {
    const timer = setInterval(() => {
      setDecisionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-navigate to home screen when time runs out
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleContinue = () => {
    // Use continueGame to preserve the score when continuing
    continueGame();
    // Navigate to category selection
    navigate('/categories');
  };

  const handleExit = () => {
    // Instead of resetting the game right away, navigate to the exit screen
    // The game will be reset after the exit screen
    navigate('/exit');
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-pink-500 p-8 rounded-xl border-4 border-white/30 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="flex justify-between mb-4">
            <div className="text-black font-mono text-xl font-bold">
              00:{decisionTimeLeft.toString().padStart(2, '0')} left to decide
            </div>
            <div className="text-black font-mono text-xl font-bold">
              Score: + {score}
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-4 text-green-700 font-mono drop-shadow-md">
            Time is up! Round Over :(
          </h2>
          <p className="text-3xl mb-8 text-green-700 font-mono">
            Choose one of the options🎯
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <Button
              onClick={handleContinue}
              className="bg-yellow-300 hover:bg-yellow-400 text-green-700 font-bold text-2xl py-8 rounded-xl border-4 border-white/30 flex flex-col items-center"
            >
              <span>Continue?</span>
              <span className="text-sm block mt-1">
                {isLastQuestion ? "Choose a new category" : "[Your points won't go away]"}
              </span>
              <ArrowRight className="mt-2" size={24} />
            </Button>
            
            <Button
              onClick={handleExit}
              className="bg-yellow-300 hover:bg-yellow-400 text-red-600 font-bold text-2xl py-8 rounded-xl border-4 border-white/30 flex flex-col items-center"
            >
              <span>Exit?</span>
              <PowerOff className="mt-2" size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeUpScreen;
