
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Circle, Triangle, Square, Star } from 'lucide-react';

const CandySelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score: contextScore } = useTrivia();
  
  // Use the score from navigation state if available, otherwise use the context score
  const score = location.state?.finalScore !== undefined ? location.state.finalScore : contextScore;

  const handleSelectCandy = (candyType: string) => {
    navigate('/dispensing', { state: { candyType } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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
      
      <div className="w-full max-w-4xl z-10 mt-10">
        <div className="text-right mb-6">
          <h2 className="text-5xl font-bold font-mono" style={{ 
            color: 'black', 
            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' 
          }}>
            Score: + {score}
          </h2>
        </div>
        
        <h1 className="text-7xl font-bold mb-16 text-center font-mono" style={{ 
          color: '#2a652a', 
          textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff'
        }}>
          Select your candy!
        </h1>
        
        {/* Candy Selection Grid */}
        <div className="grid grid-cols-2 gap-8 mx-auto max-w-3xl mb-20">
          {/* Circle - 10 points */}
          <div 
            onClick={() => handleSelectCandy('circle')}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-8 rounded-xl border-4 border-white h-44 flex flex-col items-center justify-center cursor-pointer"
          >
            <Circle className="w-24 h-24 mb-3 stroke-[3px]" />
            <span className="font-mono text-2xl font-bold">10 points</span>
          </div>
          
          {/* Triangle - 20 points */}
          <div
            onClick={() => handleSelectCandy('triangle')}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-8 rounded-xl border-4 border-white h-44 flex flex-col items-center justify-center cursor-pointer"
          >
            <Triangle className="w-24 h-24 mb-3 stroke-[3px]" />
            <span className="font-mono text-2xl font-bold">20 points</span>
          </div>
          
          {/* Square - 30 points */}
          <div
            onClick={() => handleSelectCandy('square')}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-8 rounded-xl border-4 border-white h-44 flex flex-col items-center justify-center cursor-pointer"
          >
            <Square className="w-24 h-24 mb-3 stroke-[3px]" />
            <span className="font-mono text-2xl font-bold">30 points</span>
          </div>
          
          {/* Star - 40 points */}
          <div
            onClick={() => handleSelectCandy('star')}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-8 rounded-xl border-4 border-white h-44 flex flex-col items-center justify-center cursor-pointer"
          >
            <Star className="w-24 h-24 mb-3 stroke-[3px]" />
            <span className="font-mono text-2xl font-bold">40 points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandySelectionScreen;
