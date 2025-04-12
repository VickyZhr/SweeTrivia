import React, { useEffect, useState, useCallback } from 'react';
import { TriviaQuestion } from '@/utils/triviaUtils';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NarrationControl from './trivia/NarrationControl';
import AnswerOption from './AnswerOption';

interface TriviaCardProps {
  question: TriviaQuestion;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ question }) => {
  const {
    selectedAnswer,
    selectAnswer,
    hasAnswered,
    goToNextQuestion,
    score,
    timeLeft,
    setTimeLeft,
    isGameOver,
    timeUp,
    setTimeUp,
  } = useTrivia();

  const navigate = useNavigate();
  const [narrationDone, setNarrationDone] = useState(false);

  const handleNarrationEnd = useCallback(() => {
    setNarrationDone(true);
  }, []);

  useEffect(() => {
    setNarrationDone(false);
  }, [question]);

  useEffect(() => {
    if (!hasAnswered && timeLeft > 0 && !isGameOver && narrationDone) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setTimeUp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasAnswered, timeLeft, isGameOver, narrationDone]);

  const handleAnswer = (answer: string) => {
    if (!hasAnswered && narrationDone) {
      selectAnswer(answer);
      setTimeout(() => {
        goToNextQuestion();
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <NarrationControl
        question={question.question}
        options={question.options}
        onNarrationEnd={handleNarrationEnd}
      />
      <div className="relative bg-hot-pink p-6 rounded-lg">
        <div className="mb-6 flex justify-between items-center">
          <span className="pixel-text text-2xl font-semibold">
            TIME: {timeLeft}s
          </span>
          <span className="pixel-text text-2xl font-semibold">SCORE: {score}</span>
        </div>

        <h2 className="pixel-text-lg text-3xl font-bold mb-6 tracking-wide">
          {question.question}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(question.options).map(([key, value], index) => {
            let correctness: boolean | null = null;
            const normalizedOption = key.trim().toLowerCase();
            const normalizedCorrect = question.correctAnswer
              ? question.correctAnswer.trim().toLowerCase()
              : '';

            if (hasAnswered) {
              if (normalizedOption === normalizedCorrect) {
                correctness = true;
              } else if (key === selectedAnswer) {
                correctness = false;
              }
            }

            return (
              <AnswerOption
                key={index}
                index={index}
                option={value}
                selected={selectedAnswer === key}
                correct={correctness}
                disabled={!narrationDone || hasAnswered}
                onSelect={() => handleAnswer(key)}
              />
            );
          })}
        </div>

        {isGameOver && (
          <div className="mt-6 text-center">
            <p className="pixel-text-lg text-3xl font-bold mb-2">GAME OVER!</p>
            <p className="pixel-text text-2xl mb-4">FINAL SCORE: {score}</p>
            <Button 
              className="bg-yellow-300 hover:bg-yellow-400 text-black text-2xl font-mono border-4 border-white py-2 px-6 rounded-full" 
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaCard;
