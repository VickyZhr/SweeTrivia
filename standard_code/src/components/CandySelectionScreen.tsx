
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Circle, Triangle, Square, Star } from 'lucide-react';
import { toast } from 'sonner';

const CandySelectionScreen = () => {
  const candyAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    candyAudioRef.current = new Audio("/sounds/candy_selection_page.mp3");
    candyAudioRef.current.play().catch(err => console.warn("Audio error:", err));

    return () => {
      if (candyAudioRef.current) {
        candyAudioRef.current.pause();
        candyAudioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { score: contextScore } = useTrivia();
  
  // Use the score from navigation state if available, otherwise use the context score
  const score = location.state?.finalScore !== undefined ? location.state.finalScore : contextScore;

  // Redirect to home page if score is 0
  useEffect(() => {
    if (score <= 0) {
      navigate('/');
    }
  }, [score, navigate]);

  const handleSelectCandy = (candyType: string, requiredPoints: number) => {
    // Check if the user has enough points
    if (score < requiredPoints) {
      // Display warning-styled error message with consistent 2-second duration
      toast.error("Not enough points!", {
        description: `You need ${requiredPoints} points for this candy.`,
        duration: 2000,
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#B71C1C',
          border: '3px solid #FF453A',
          padding: '2.5rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(to right, #FFEBEE, #FFCDD2)',
          boxShadow: '0 4px 25px rgba(0,0,0,0.25)',
          width: '95%',
          maxWidth: '550px',
          marginBottom: '2rem'
        }
      });
      return;
    }
    
    // If they have enough points, proceed to dispensing
    navigate('/dispensing', { state: { candyType } });
  };

  // If score is 0, the useEffect will handle redirection, but return null to avoid rendering
  if (score <= 0) {
    return null;
  }

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
      
      <div className="w-full max-w-4xl z-10 mt-0">
        <div className="text-right mb-4">
          <h2 className="text-4xl font-bold font-mono" style={{ 
            color: 'black', 
            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' 
          }}>
            Score: + {score}
          </h2>
        </div>
        
        <h1 className="text-6xl font-bold mb-10 text-center font-mono" style={{ 
          color: '#2a652a', 
          textShadow: '3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff'
        }}>
          Select your candy!
        </h1>
        
        {/* Candy Selection Grid - Smaller cards */}
        <div className="grid grid-cols-2 gap-6 mx-auto max-w-2xl mb-16">
          {/* Circle - 10 points */}
          <div 
            onClick={() => handleSelectCandy('circle', 10)}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-6 rounded-xl border-4 border-white h-36 flex flex-col items-center justify-center cursor-pointer"
          >
            <Circle className="w-20 h-20 mb-2 stroke-[3px]" />
            <span className="font-mono text-4xl font-bold">10 points</span>
          </div>
          
          {/* Triangle - 20 points */}
          <div
            onClick={() => handleSelectCandy('triangle', 20)}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-6 rounded-xl border-4 border-white h-36 flex flex-col items-center justify-center cursor-pointer"
          >
            <Triangle className="w-20 h-20 mb-2 stroke-[3px]" />
            <span className="font-mono text-4xl font-bold">20 points</span>
          </div>
          
          {/* Square - 30 points */}
          <div
            onClick={() => handleSelectCandy('square', 30)}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-6 rounded-xl border-4 border-white h-36 flex flex-col items-center justify-center cursor-pointer"
          >
            <Square className="w-20 h-20 mb-2 stroke-[3px]" />
            <span className="font-mono text-4xl font-bold">30 points</span>
          </div>
          
          {/* Star - 40 points */}
          <div
            onClick={() => handleSelectCandy('star', 40)}
            className="bg-yellow-300 hover:bg-yellow-400 text-black p-6 rounded-xl border-4 border-white h-36 flex flex-col items-center justify-center cursor-pointer"
          >
            <Star className="w-20 h-20 mb-2 stroke-[3px]" />
            <span className="font-mono text-4xl font-bold">40 points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandySelectionScreen;
