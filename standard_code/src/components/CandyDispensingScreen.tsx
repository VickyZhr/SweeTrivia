import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Circle, Triangle, Square, Star } from 'lucide-react';
import { toast } from 'sonner';

const CandyDispensingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candyType, setCandyType] = useState<string | null>(null);
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [remainingPoints, setRemainingPoints] = useState<number>(0);

  useEffect(() => {
    if (location.state && location.state.candyType) {
      setCandyType(location.state.candyType);

      if (location.state.remainingPoints !== undefined) {
        setRemainingPoints(location.state.remainingPoints);
      }

      dispenseCandyFromServer(location.state.candyType);
    }
  }, [location.state]);

  const dispenseCandyFromServer = async (candy: string) => {
    setIsDispensing(true);

    toast.info("Dispensing candy...", {
      description: "Please wait while your candy is being dispensed.",
      duration: 3000
    });

    try {
      const response = await fetch('http://localhost:8083/dispense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candyType: candy }),
      });

      toast.success("Candy dispensed successfully!", {
        description: "Enjoy your treat!",
        duration: 3000
      });
    } catch (error) {
      console.error('Error dispensing candy:', error);
    } finally {
      setIsDispensing(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
      <div className="absolute top-5 w-[95%] mx-auto">
        <img 
          src="/lovable-uploads/92149b53-6c92-4ab5-b43e-94cf49eea917.png" 
          alt="Top shapes" 
          className="w-full"
        />
      </div>

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

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          {remainingPoints >= 10 && (
            <Button
              onClick={() => navigate('/selection', { state: { remainingPoints } })}
              className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-8 px-12 rounded-xl text-3xl font-mono"
            >
              Choose More Candy
            </Button>
          )}
          <Button
            onClick={handleGoHome}
            className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-8 px-12 rounded-xl text-3xl font-mono"
          >
            Play Again
          </Button>
        </div>
      </div>

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
