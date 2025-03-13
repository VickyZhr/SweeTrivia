
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TransitionLayout from '@/components/TransitionLayout';
import TriviaCard from '@/components/TriviaCard';
import { FileText, Download, RefreshCcw } from 'lucide-react';

const Completion = () => {
  const navigate = useNavigate();
  const { questions, exportToCSV } = useTrivia();

  const handleDownload = () => {
    if (questions.length === 0) {
      toast.error('No questions to export');
      return;
    }

    const csvContent = exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sweet-trivia.csv');
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file downloaded successfully');
  };

  const handleCreateNew = () => {
    navigate('/');
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
        
        <TriviaCard className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-3">Trivia Created!</h2>
          <p className="text-gray-600 mb-8">
            You've successfully created {questions.length} trivia questions.
            Download your trivia set as a CSV file or create a new set.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleDownload}
              className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="mr-2 h-5 w-5" />
              Download CSV
            </Button>
            
            <Button 
              onClick={handleCreateNew}
              variant="outline"
              className="w-full h-12 text-lg font-medium"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Create New Trivia Set
            </Button>
          </div>
        </TriviaCard>
      </div>
    </TransitionLayout>
  );
};

export default Completion;
