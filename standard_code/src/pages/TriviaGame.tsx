import React, { useEffect, useRef } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import TriviaCard from '@/components/TriviaCard';
import ResultScreen from '@/components/ResultScreen';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import TriviaSettings from '@/components/TriviaSettings';
import { ArrowLeft } from 'lucide-react';
import RoundUp from '@/components/RoundUp';

const TriviaGame: React.FC = () => {
  const { 
    currentQuestion, 
    isGameOver,
    score,
    questions,
    timeUp
  } = useTrivia();

  const navigate = useNavigate();
  const location = useLocation();
  const totalQuestions = questions.length;

  const roundOverAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (timeUp && roundOverAudioRef.current) {
      roundOverAudioRef.current.play().catch(err => {
        console.warn("Audio error:", err);
      });
    }
  }, [timeUp]);

  if (!currentQuestion && !isGameOver && !timeUp) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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
        <div className="z-10">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Questions</h1>
          <p className="mb-8 text-white">Unable to load trivia questions. Please try again.</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-xl py-3 px-6 rounded-full border-2 border-white/80 flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    );
  }

  if (timeUp) return (
    <>
      <audio ref={roundOverAudioRef} src="/sounds/round_over_cleaned.mp3" preload="auto" />
      <RoundUp />
    </>
  );

  if (isGameOver) return <ResultScreen score={score} totalQuestions={totalQuestions} />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
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

      <TriviaSettings />
      <div className="w-full max-w-4xl z-10">
        {currentQuestion && <TriviaCard question={currentQuestion} />}
      </div>

      <Button
        onClick={() => navigate('/')}
        className="absolute bottom-8 left-8 bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-xl py-3 px-6 rounded-full border-2 border-white/80 flex items-center gap-2 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </Button>
    </div>
  );
};

export default TriviaGame;
