import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useTrivia } from '@/context/TriviaContext';

const MakeQuestionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const { loadQuestions } = useTrivia();
  const handleDownloadFromCloud = async () => {
    try {
      const res = await fetch('http://localhost:8083/trigger-fetch-and-prepare', {
        method: 'POST',
      });
      const text = await res.text();
      alert(text);
  
      // 🔄 Reload questions immediately from updated JSON
      const response = await fetch('/data/questions_and_choices.json');
      const updatedJson = await response.json();
      loadQuestions(JSON.stringify(updatedJson));  // load entire updated JSON synchronously
    } catch (err) {
      alert("❌ Failed to fetch: " + err);
    }
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
        <h1 className="pixel-text-lg text-6xl mb-6 text-center tracking-widest">
          MY QUESTIONS
        </h1>
      
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl border-4 border-white/50 w-full mb-8">
          <h2 className="text-3xl font-bold mb-6 font-mono text-center">Create Your Own Trivia Set</h2>
        
          <p className="text-xl mb-8 font-mono text-center">
            Download our template and create your custom trivia questions!
          </p>
        
          <Button
            onClick={handleDownloadFromCloud}
            className="bg-yellow-300 hover:bg-yellow-400 text-black text-2xl font-mono border-4 border-white py-4 px-8 rounded-3xl w-full flex items-center justify-center gap-3"
          >
            <Download className="h-6 w-6" />
            Download Question Set From Cloud
          </Button>
        </div>
      </div>
    
      {/* Go Back button */}
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

export default MakeQuestionsPage;