
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
    // For now, this just loads default questions and goes to categories
    // You can implement a different flow for challenge mode later
    navigate('/categories');
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

  // Render geometric shapes for background
  const renderShapes = () => {
    return (
      <>
        {/* Top row shapes */}
        <div className="absolute top-5 left-10 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute top-20 left-40 w-16 h-16 border-4 border-white transform rotate-45"></div>
        <div className="absolute top-5 left-80 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute top-20 right-80 w-16 h-16 border-4 border-white transform rotate-45"></div>
        <div className="absolute top-5 right-40 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute top-20 right-10 w-16 h-16 border-4 border-white transform rotate-45"></div>
        
        {/* Bottom row shapes */}
        <div className="absolute bottom-20 left-10 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-5 left-40 w-16 h-16 border-4 border-white transform rotate-45"></div>
        <div className="absolute bottom-20 left-80 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-5 right-80 w-16 h-16 border-4 border-white transform rotate-45"></div>
        <div className="absolute bottom-20 right-40 w-16 h-16 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-5 right-10 w-16 h-16 border-4 border-white transform rotate-45"></div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pink-500 relative overflow-hidden">
      {renderShapes()}
      
      <div className="w-full max-w-2xl z-10">
        <h1 className="text-6xl font-bold text-center text-green-800 mb-2 font-mono tracking-wider drop-shadow-lg">
          SWEETRIVIA
        </h1>
        
        <h2 className="text-4xl font-bold text-center text-green-800 mb-8 font-mono tracking-wide">
          Select Mode! 🦑
        </h2>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Button
            onClick={handleStandardMode}
            variant="yellow"
            size="xl"
            className="p-6 text-4xl font-mono"
          >
            Standard
          </Button>
          
          <Button
            onClick={handleChallengeMode}
            variant="yellow" 
            size="xl"
            className="p-6 text-4xl font-mono"
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
    </div>
  );
};

export default Index;
