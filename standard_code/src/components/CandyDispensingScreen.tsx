import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Circle, Triangle, Square, Star } from 'lucide-react';

const CandyDispensingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candyType, setCandyType] = useState<string | null>(null);
  
  useEffect(() => {
    if (location.state && location.state.candyType) {
      const selected = location.state.candyType;
      setCandyType(selected);

      // Send candy selection to Raspberry Pi backend
      axios.post('http://localhost:3001/dispense', { candyType: selected })
        .then(() => {
          console.log(`Successfully dispensed ${selected} candy`);
        })
        .catch((err) => {
          console.error('Error sending candy selection to backend:', err);
        });
    }
  }, [location.state]);

  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  // Render the appropriate candy shape based on selection
  const renderCandyShape = () => {
    switch (candyType) {
      case 'circle':
        return <Circle className="w-32 h-32 text-yellow-300 stroke-[3px] mb-6" />;
      case 'triangle':
        return <Triangle className="w-32 h-32 text-yellow-300 stroke-[3px] mb-6" />;
      case 'square':
        return <Square className="w-32 h-32 text-yellow-300 stroke-[3px] mb-6" />;
      case 'star':
        return <Star className="w-32 h-32 text-yellow-300 stroke-[3px] mb-6" />;
      default:
        return null;
    }
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
      
      <div className="w-full max-w-2xl z-10 text-center flex flex-col items-center">
        {renderCandyShape()}
        
        <h2 className="text-4xl font-bold mb-4 font-mono pixel-text-lg" style={{ 
          color: '#2a652a', 
          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' 
        }}>
          {candyType ? `${candyType.charAt(0).toUpperCase() + candyType.slice(1)} candy dispensed!` : 'Candy dispensed!'}
        </h2>
        
        <p className="text-4xl mb-10 font-mono" style={{ 
          color: 'black', 
          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' 
        }}>
          Thanks for playing with SweeTrivia 👋🍬
        </p>
        
        <Button
          onClick={handleGoHome}
          className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-8 px-12 rounded-xl mx-auto text-3xl font-mono"
        >
          Play Again
        </Button>
      </div>
      
      {/* Standardized Go Back button */}
      <Button 
        onClick={handleGoBack}
        className="absolute bottom-8 left-8 bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-xl py-3 px-6 rounded-full border-2 border-white/80 flex items-center gap-2 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </Button>
    </div>
  );
};

export default CandyDispensingScreen;
