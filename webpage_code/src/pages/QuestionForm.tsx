
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrivia, Question } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TransitionLayout from '@/components/TransitionLayout';
import TriviaCard from '@/components/TriviaCard';

const QuestionForm = () => {
  const { currentQuestion } = useParams();
  const navigate = useNavigate();
  const { totalQuestions, addQuestion, updateQuestion, getQuestionById } = useTrivia();
  
  const questionNumber = parseInt(currentQuestion || '1');
  const isLastQuestion = questionNumber === totalQuestions;
  
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: ''
  });

  useEffect(() => {
    if (questionNumber > totalQuestions) {
      navigate('/completion');
      return;
    }
    
    const existingQuestion = getQuestionById(questionNumber);
    if (existingQuestion) {
      setFormData({
        text: existingQuestion.text,
        optionA: existingQuestion.optionA,
        optionB: existingQuestion.optionB,
        optionC: existingQuestion.optionC,
        optionD: existingQuestion.optionD,
        correctAnswer: existingQuestion.correctAnswer
      });
    }
  }, [questionNumber, totalQuestions, navigate, getQuestionById]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.text.trim()) {
      toast.error('Please enter a question');
      return false;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim() || 
        !formData.optionC.trim() || !formData.optionD.trim()) {
      toast.error('Please fill in all answer options');
      return false;
    }
    if (!formData.correctAnswer) {
      toast.error('Please select the correct answer');
      return false;
    }
    return true;
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    
    const question: Question = {
      id: questionNumber,
      ...formData
    };
    
    const existingQuestion = getQuestionById(questionNumber);
    if (existingQuestion) {
      updateQuestion(question);
    } else {
      addQuestion(question);
    }
    
    if (isLastQuestion) {
      navigate('/completion');
    } else {
      navigate(`/questions/${questionNumber + 1}`);
    }
  };

  return (
    <TransitionLayout>
      <div className="flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-primary">
            Question {questionNumber}/{totalQuestions}
          </h1>
          <div className="mt-2 h-1.5 w-full max-w-md rounded-full bg-gray-200">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <TriviaCard className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="question" className="text-base">Question</Label>
            <Input
              id="question"
              placeholder="Enter your question"
              className="h-12 text-lg"
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optionA" className="text-base">Option A</Label>
              <Input
                id="optionA"
                placeholder="Enter option A"
                value={formData.optionA}
                onChange={(e) => handleInputChange('optionA', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionB" className="text-base">Option B</Label>
              <Input
                id="optionB"
                placeholder="Enter option B"
                value={formData.optionB}
                onChange={(e) => handleInputChange('optionB', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionC" className="text-base">Option C</Label>
              <Input
                id="optionC"
                placeholder="Enter option C"
                value={formData.optionC}
                onChange={(e) => handleInputChange('optionC', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionD" className="text-base">Option D</Label>
              <Input
                id="optionD"
                placeholder="Enter option D"
                value={formData.optionD}
                onChange={(e) => handleInputChange('optionD', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="correctAnswer" className="text-base">Correct Answer</Label>
            <Select
              value={formData.correctAnswer}
              onValueChange={(value) => handleInputChange('correctAnswer', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select the correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Option A</SelectItem>
                <SelectItem value="B">Option B</SelectItem>
                <SelectItem value="C">Option C</SelectItem>
                <SelectItem value="D">Option D</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleSaveAndContinue}
              className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLastQuestion ? 'Finish' : 'Continue'}
            </Button>
          </div>
        </TriviaCard>
      </div>
    </TransitionLayout>
  );
};

export default QuestionForm;
