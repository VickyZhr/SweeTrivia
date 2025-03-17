
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Circle, Triangle, Square, Star } from 'lucide-react';

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
        <div className="flex justify-end mb-4">
          <div className="text-black font-mono text-3xl font-bold">
            Score: + {score}
          </div>
        </div>
        
        <h2 className="text-6xl font-bold mb-10 text-green-800 font-mono tracking-wide" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
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
    </div>
  );
};

export default CandySelectionScreen;
