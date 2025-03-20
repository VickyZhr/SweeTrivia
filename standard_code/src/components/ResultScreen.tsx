
import React, { useEffect } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { calculatePercentage } from '@/utils/triviaUtils';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Update the component to accept props properly
interface ResultScreenProps {
  score: number;
  totalQuestions: number;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions }) => {
  const { resetGame } = useTrivia();
  const percentage = calculatePercentage(score, totalQuestions);
  const navigate = useNavigate();
  
  // Navigate to home screen after 10 seconds (updated from 5)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Determine message based on score
  const getMessage = () => {
    if (percentage >= 90) return "Amazing job!";
    if (percentage >= 70) return "Great work!";
    if (percentage >= 50) return "Good effort!";
    return "Keep practicing!";
  };

  // Go back to the previous screen without resetting
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 w-full max-w-md mx-auto border-2 border-white/30 text-center animate-slide-up relative">
      <h2 className="text-2xl font-bold mb-2 text-green-800 pixel-text tracking-wide">Candy dispense completed :)</h2>
      <p className="text-white mb-8">{getMessage()}</p>
      
      <div className="mb-8">
        <div className="text-4xl font-bold text-yellow-300 mb-2">{percentage}%</div>
        <p className="text-white">
          You scored <span className="font-semibold">{score} out of {totalQuestions}</span>
        </p>
      </div>
      
      <div className="flex flex-col space-y-3">
        <Button
          onClick={() => {
            resetGame();
            navigate('/');
          }}
          className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold rounded-xl px-6 py-2 flex items-center justify-center w-full border-2 border-white/30"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Play Again
        </Button>
      </div>
      
      <div className="mt-4 text-white/70 animate-pulse">
        Returning to home in 10 seconds...
      </div>
      
      {/* Standardized Go Back button */}
      <Button 
        onClick={handleGoBack}
        className="fixed bottom-8 left-8 bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-xl py-3 px-6 rounded-full border-2 border-white/80 flex items-center gap-2 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </Button>
    </div>
  );
};

export default ResultScreen;
