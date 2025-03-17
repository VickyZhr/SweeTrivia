
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Circle, Triangle, Square, Star, ArrowLeft } from 'lucide-react';

const CandySelectionScreen: React.FC = () => {
  const { score } = useTrivia();
  const navigate = useNavigate();
  const [selectedCandy, setSelectedCandy] = useState<string | null>(null);
  
  // Candy options with their corresponding icons
  const candyOptions = [
    { id: 'circle', icon: Circle },
    { id: 'triangle', icon: Triangle },
    { id: 'square', icon: Square },
    { id: 'star', icon: Star },
  ];

  const handleCandySelect = (candyId: string) => {
    setSelectedCandy(candyId);
    
    // After selecting candy, wait 1 second then navigate to dispensing screen
    setTimeout(() => {
      navigate('/dispensing');
    }, 1000);
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
        <div className="flex justify-end mb-4 items-center">
          <div className="text-black font-mono text-xl font-bold">
            Score: + {score}
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-10 pixel-text-lg">
          Select your candy!🍬
        </h2>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl mx-auto">
          {candyOptions.map((candy, index) => (
            <Button
              key={candy.id}
              onClick={() => handleCandySelect(candy.id)}
              className={`h-24 ${
                selectedCandy === candy.id
                  ? 'bg-white border-2 border-yellow-300'
                  : 'bg-yellow-300'
              } hover:bg-yellow-400 text-black font-bold rounded-xl`}
            >
              <candy.icon className="h-12 w-12" />
            </Button>
          ))}
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

export default CandySelectionScreen;
