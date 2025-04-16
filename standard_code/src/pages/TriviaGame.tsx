import React from 'react';
import { useTrivia } from '@/context/TriviaContext';
import TriviaCard from '@/components/TriviaCard';
import ResultScreen from '@/components/ResultScreen';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import TriviaSettings from '@/components/TriviaSettings';
import { ArrowLeft } from 'lucide-react';
import RoundUp from '@/components/RoundUp';
import { useEffect } from 'react';
import { playSound } from '@/utils/soundUtils';

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

  useEffect(() => {
    if (timeUp) {
      playSound("round_over.wav");
    }
  }, [timeUp]);

  if (!currentQuestion && !isGameOver && !timeUp) {
    return (
      <div className="...">
        <h1 className="...">Error Loading Questions</h1>
        <p className="...">Unable to load trivia questions. Please try again.</p>
        <Button onClick={() => navigate('/')} className="...">Go Back</Button>
      </div>
    );
  }

  if (timeUp) return <RoundUp />;
  if (isGameOver) return <ResultScreen score={score} totalQuestions={totalQuestions} />;

  return (
    <div className="...">
      <TriviaSettings />
      <div className="w-full max-w-4xl z-10">
        {currentQuestion && <TriviaCard question={currentQuestion} />}
      </div>
      <Button onClick={() => navigate('/')} className="...">
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </Button>
    </div>
  );
};

export default TriviaGame;
