
import React, { useEffect } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Candy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExitScreen: React.FC = () => {
  const { score, resetGame } = useTrivia();
  const navigate = useNavigate();
  
  // Auto-navigate to home after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // Navigate to candy selection instead of resetting and going home
    navigate('/selection');
  };
  
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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
      
      <div className="w-full max-w-2xl z-10 text-center">
        <h1 className="text-3xl font-bold mb-6 pixel-text-lg">
          You chose to exit the game
        </h1>
        
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-2xl font-bold pixel-text">
            You have <span className="italic">{score} points</span> to choose your candy
          </h2>
          <Candy className="ml-2 text-red-500 h-8 w-8" />
        </div>
        
        <Button
          onClick={handleContinue}
          className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-2xl py-8 px-12 rounded-full"
        >
          Tap to continue!
        </Button>
        
        <div className="mt-4 text-white/70 animate-pulse">
          Proceeding to candy selection in 10 seconds...
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

export default ExitScreen;
