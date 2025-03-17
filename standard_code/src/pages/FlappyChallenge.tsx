
import React from 'react';
import FlappyGame from '@/components/FlappyGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlappyChallenge: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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
      
      <div className="relative z-10 p-4">
        <FlappyGame />
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

export default FlappyChallenge;
