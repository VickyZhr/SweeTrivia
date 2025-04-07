
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTrivia } from '@/context/TriviaContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { loadQuestions } = useTrivia();

  const handleStandardMode = () => {
    navigate('/categories'); // Go to category selection
  };

  const handleChallengeMode = () => {
    // Navigate to the flappy bird challenge mode
    navigate('/flappy');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      try {
        loadQuestions(csvData);
        navigate('/categories'); // Go to category selection after loading custom questions
      } catch (error) {
        console.error("Failed to load custom questions:", error);
        alert(`Failed to load custom questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
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
      
      <div className="w-full max-w-2xl z-10 flex flex-col items-center">
        <h1 className="pixel-text-lg text-6xl mb-2 text-center tracking-widest">
          SWEETRIVIA
        </h1>
        
        <h2 className="pixel-text text-4xl mb-12 text-center tracking-wide">
          Select Mode! 🦑
        </h2>
        
        <div className="grid grid-cols-2 gap-8 mb-8 w-full">
          <Button
            onClick={handleStandardMode}
            className="bg-yellow-300 hover:bg-yellow-400 text-black text-4xl font-mono border-4 border-white h-24 rounded-3xl"
          >
            Standard
          </Button>
          
          <Button
            onClick={handleChallengeMode}
            className="bg-yellow-300 hover:bg-yellow-400 text-black text-4xl font-mono border-4 border-white h-24 rounded-3xl"
          >
            Challenge
          </Button>
        </div>
        
        <div className="hidden">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.txt"
            onChange={handleFileUpload}
          />
        </div>
      </div>
      
      {/* No Back Button on Home Page */}
    </div>
  );
};

export default Index;
