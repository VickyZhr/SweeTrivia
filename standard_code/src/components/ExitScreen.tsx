
import React, { useEffect } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Candy } from 'lucide-react';
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

  // Generate background shapes (circles, triangles, squares)
  const renderShapes = () => {
    const shapes = [];
    const shapeClasses = [
      "w-16 h-16 rounded-full border-4 border-white/80", // Circle
      "w-16 h-16 rotate-45 border-4 border-white/80", // Square
      "w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-white/80" // Triangle
    ];
    
    for (let i = 0; i < 12; i++) {
      const shapeType = i % 3;
      const isTopRow = i < 6;
      shapes.push(
        <div 
          key={i}
          className={`absolute ${shapeClasses[shapeType]}`}
          style={{
            left: `${(i % 6) * 16 + 5}%`,
            top: isTopRow ? '2%' : '80%',
          }}
        />
      );
    }
    
    return shapes;
  };

  return (
    <div className="w-full h-screen bg-pink-500 flex items-center justify-center p-6 relative overflow-hidden">
      {renderShapes()}
      
      <div className="w-full max-w-2xl z-10 text-center">
        <h1 className="text-6xl font-bold mb-6 text-green-800 font-mono tracking-wide" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
          You chose to exit the game
        </h1>
        
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-4xl font-bold text-green-800 font-mono tracking-wide" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
            You have <span className="italic">{score} points</span> to choose your candy
          </h2>
          <Candy className="ml-2 text-red-500 h-8 w-8" />
        </div>
        
        <Button
          onClick={handleContinue}
          className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-4xl py-12 px-16 rounded-full"
        >
          Tap to continue!
        </Button>
        
        <div className="mt-4 text-white/70 animate-pulse">
          Proceeding to candy selection in 10 seconds...
        </div>
      </div>
    </div>
  );
};

export default ExitScreen;
