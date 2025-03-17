
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const CandyDispensingScreen: React.FC = () => {
  const navigate = useNavigate();
  
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
        <h2 className="text-6xl font-bold mb-4 text-green-800 font-mono tracking-wide" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
          Candy dispense completed :)
        </h2>
        
        <p className="text-4xl mb-10 text-green-800 font-mono tracking-wide" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
          Thanks for playing with SweeTrivia 👋🍬
        </p>
        
        <Button
          onClick={() => navigate('/')}
          className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-8 px-12 rounded-xl mx-auto text-3xl font-mono"
        >
          Go to home
        </Button>
      </div>
    </div>
  );
};

export default CandyDispensingScreen;
