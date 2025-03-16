
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import QuestionInput from '@/components/QuestionInput';
import Header from '@/components/Header';
import { toast } from '@/utils/toast';
import { TriviaQuestion } from '@/utils/csvUtils';

const QuestionForm = () => {
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const navigate = useNavigate();
  
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion>({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
  });
  
  useEffect(() => {
    // Get the total number of questions from local storage
    const storedTotalQuestions = localStorage.getItem('numberOfQuestions');
    if (storedTotalQuestions) {
      setTotalQuestions(parseInt(storedTotalQuestions, 10));
    }
    
    // Get stored questions from local storage
    const storedQuestions = localStorage.getItem('triviaQuestions');
    if (storedQuestions) {
      const parsedQuestions: TriviaQuestion[] = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      
      // Load current question if it exists
      const currentIndex = parseInt(questionNumber || '1', 10) - 1;
      if (parsedQuestions[currentIndex]) {
        setCurrentQuestion(parsedQuestions[currentIndex]);
      }
    }
  }, [questionNumber]);
  
  const validateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return false;
    }
    if (!currentQuestion.optionA.trim()) {
      toast.error("Please enter option A");
      return false;
    }
    if (!currentQuestion.optionB.trim()) {
      toast.error("Please enter option B");
      return false;
    }
    if (!currentQuestion.optionC.trim()) {
      toast.error("Please enter option C");
      return false;
    }
    if (!currentQuestion.optionD.trim()) {
      toast.error("Please enter option D");
      return false;
    }
    if (!currentQuestion.correctAnswer) {
      toast.error("Please select the correct answer");
      return false;
    }
    return true;
  };
  
  const handleSaveQuestion = () => {
    if (!validateQuestion()) return;
    
    const currentIndex = parseInt(questionNumber || '1', 10) - 1;
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = currentQuestion;
    
    setQuestions(updatedQuestions);
    localStorage.setItem('triviaQuestions', JSON.stringify(updatedQuestions));
    
    toast.success("Question saved successfully");
  };
  
  const handleContinue = () => {
    if (!validateQuestion()) return;
    
    handleSaveQuestion();
    
    const currentIndex = parseInt(questionNumber || '1', 10) - 1;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < totalQuestions) {
      navigate(`/questions/${nextIndex + 1}`);
    } else {
      navigate('/finish');
    }
  };
  
  const isLastQuestion = parseInt(questionNumber || '1', 10) === totalQuestions;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <Card className="w-full max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-medium">
                Question {questionNumber} of {totalQuestions}
              </h2>
              <span className="text-white/60 text-sm">
                {Math.round((parseInt(questionNumber || '1', 10) / totalQuestions) * 100)}% Complete
              </span>
            </div>
            
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-trivia-pink h-full transition-all duration-500 ease-out"
                style={{ width: `${(parseInt(questionNumber || '1', 10) / totalQuestions) * 100}%` }}
              />
            </div>
            
            <QuestionInput
              question={currentQuestion.question}
              optionA={currentQuestion.optionA}
              optionB={currentQuestion.optionB}
              optionC={currentQuestion.optionC}
              optionD={currentQuestion.optionD}
              correctAnswer={currentQuestion.correctAnswer}
              onQuestionChange={(value) => setCurrentQuestion({ ...currentQuestion, question: value })}
              onOptionAChange={(value) => setCurrentQuestion({ ...currentQuestion, optionA: value })}
              onOptionBChange={(value) => setCurrentQuestion({ ...currentQuestion, optionB: value })}
              onOptionCChange={(value) => setCurrentQuestion({ ...currentQuestion, optionC: value })}
              onOptionDChange={(value) => setCurrentQuestion({ ...currentQuestion, optionD: value })}
              onCorrectAnswerChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleSaveQuestion}
              >
                Save
              </Button>
              
              <Button 
                variant={isLastQuestion ? "primary" : "secondary"}
                className="flex-1"
                onClick={handleContinue}
              >
                {isLastQuestion ? 'Finish' : 'Continue'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuestionForm;
