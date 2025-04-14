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

  const handleAnswer = (letter: string) => {
    if (!hasAnswered && narrationDone) {
      selectAnswer(letter);
      setTimeout(() => {
        goToNextQuestion();
      }, 1000);
    }
  };

  const optionsArray = question.options
    ? Object.entries(question.options)
    : [];

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
            Score: {score}
          </span>
          <span className="pixel-text text-2xl font-semibold">
            Time Left: {timeLeft}s
          </span>
        </div>
        <div className="mb-4">
          <h2 className="pixel-text text-xl font-bold">{question.question}</h2>
        </div>

        {optionsArray.length > 0 ? (
          <div className="grid grid-cols-2 gap-4"> {/* 2-column layout */}
            {optionsArray.map(([letter, text], index) => (
              <AnswerOption
                key={letter}
                option={`${letter}: ${text}`}
                index={index}
                selected={selectedAnswer === letter}
                correct={
                  hasAnswered
                    ? question.correctAnswer === letter
                    : null
                }
                showResult={hasAnswered}
                onSelect={() => handleAnswer(letter)}
                disabled={!narrationDone || hasAnswered}
              />
            ))}
          </div>
        ) : (
          <p className="text-white text-lg font-semibold mt-4">
            ⚠️ This question is missing valid answer choices.
          </p>
        )}
      </div>
    </div>
  );
};

export default TriviaCard;
