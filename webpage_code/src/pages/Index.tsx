
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import TransitionLayout from '@/components/TransitionLayout';
import TriviaCard from '@/components/TriviaCard';

const Index = () => {
  const [count, setCount] = useState<string>('');
  const { setTotalQuestions } = useTrivia();
  const navigate = useNavigate();

  const handleContinue = () => {
    const numQuestions = parseInt(count.trim());
    
    if (isNaN(numQuestions) || numQuestions <= 0) {
      toast.error('Please enter a valid number greater than 0');
      return;
    }
    
    if (numQuestions > 100) {
      toast.error('Maximum of 100 questions allowed');
      return;
    }
    
    setTotalQuestions(numQuestions);
    navigate('/questions/1');
  };

  return (
    <TransitionLayout>
      <div className="flex flex-col items-center animate-slide-up">
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-bold text-primary tracking-tight mb-3">
            SweetTrivia
          </h1>
          <div className="h-1 w-20 bg-primary/30 mx-auto rounded-full mb-1" />
          <div className="h-1 w-10 bg-primary/20 mx-auto rounded-full" />
        </div>
        
        <TriviaCard>
          <h2 className="text-2xl font-semibold text-center mb-6">Create Your Trivia Set</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="questionCount" className="text-base">
                Number of questions you want to enter
              </Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="100"
                placeholder="Enter a number"
                className="h-12 text-lg"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleContinue}
              className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue
            </Button>
          </div>
        </TriviaCard>
      </div>
    </TransitionLayout>
  );
};

export default Index;
