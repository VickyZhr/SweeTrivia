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

      // Automatically move to next question after 1 second
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
      <div className="relative bg-hot-pink p-6">
        <div className="mb-6 flex justify-between items-center">
          <span className="text-white text-xl font-semibold">
            Time Left: {timeLeft}s
          </span>
          <span className="text-white text-xl font-semibold">Score: {score}</span>
        </div>

        <h2 className="text-white text-2xl font-bold mb-4">{question.question}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            let correctness: boolean | null = null;

            if (hasAnswered) {
              if (option === question.correct_answer) {
                correctness = true;
              }
              if (option === selectedAnswer && option !== question.correct_answer) {
                correctness = false;
              }
            }

            return (
              <AnswerOption
                key={index}
                index={index}
                option={option}
                selected={selectedAnswer === option}
                correct={correctness}
                disabled={!narrationDone || hasAnswered}
                onSelect={() => handleAnswer(option)}
              />
            );
          })}
        </div>

        {isGameOver && (
          <div className="mt-6 text-center">
            <p className="text-white text-2xl font-bold">Game Over!</p>
            <p className="text-white text-lg">Final Score: {score}</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaCard;
