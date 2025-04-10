
import React from 'react';
import FlappyGame from '@/components/FlappyGame';

const FlappyChallenge: React.FC = () => {
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
    </div>
  );
};

export default FlappyChallenge;
