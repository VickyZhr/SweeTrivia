
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import NumberInput from '@/components/NumberInput';
import { toast } from '@/utils/toast';

const Index = () => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (numberOfQuestions < 1) {
      toast.error("Please enter at least one question");
      return;
    }
    
    if (numberOfQuestions > 50) {
      toast.error("Please enter at most 50 questions");
      return;
    }
    
    // Save number of questions to local storage or a state management solution
    localStorage.setItem('numberOfQuestions', numberOfQuestions.toString());
    
    // Navigate to the first question
    navigate('/questions/1');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="animate-in fade-in w-full max-w-xl mx-auto text-center mb-8">
        <h1 
          className={`font-display text-6xl md:text-7xl font-bold text-trivia-pink mb-4 tracking-tight title-glow animate-in slide-in-down ${isAnimationComplete ? 'animate-pulse-slow' : ''}`}
        >
          SweeTrivia
        </h1>
        <p className="text-white/80 text-lg animate-in slide-in-up delay-200">
          Create your own custom trivia questions
        </p>
      </div>
      
      <Card className="animate-in fade-in delay-300 w-full">
        <div className="space-y-6">
          <NumberInput
            value={numberOfQuestions}
            onChange={setNumberOfQuestions}
            min={1}
            max={50}
            label="How many questions do you want to create?"
            className="w-full"
          />
          
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
