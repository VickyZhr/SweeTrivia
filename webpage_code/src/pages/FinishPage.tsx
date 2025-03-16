
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { toast } from '@/utils/toast';
import { TriviaQuestion, convertToCSV, downloadCSV, uploadToCloud } from '@/utils/csvUtils';

const FinishPage = () => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load questions from local storage
    const storedQuestions = localStorage.getItem('triviaQuestions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    } else {
      // If no questions, redirect back to start
      toast.error("No questions found. Please start again.");
      navigate('/');
    }
  }, [navigate]);
  
  const handleDownloadCSV = () => {
    if (questions.length === 0) {
      toast.error("No questions to download");
      return;
    }
    
    const csvData = convertToCSV(questions);
    downloadCSV(csvData);
    toast.success("CSV file downloaded successfully");
  };
  
  const handleUploadToCloud = async () => {
    if (questions.length === 0) {
      toast.error("No questions to upload");
      return;
    }
    
    setIsUploading(true);
    const csvData = convertToCSV(questions);
    
    try {
      const success = await uploadToCloud(csvData);
      if (success) {
        toast.success("Questions uploaded to Supabase successfully");
        setIsUploadComplete(true);
      } else {
        toast.error("Failed to upload questions to Supabase");
      }
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
      toast.error("An error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleStartOver = () => {
    // Clear local storage
    localStorage.removeItem('triviaQuestions');
    localStorage.removeItem('numberOfQuestions');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <Card className="w-full max-w-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-white text-2xl font-medium mb-2">
                All Done!
              </h2>
              <p className="text-white/80">
                You've created {questions.length} trivia questions.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white text-lg font-medium mb-3">
                Question Summary
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                {questions.map((q, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 text-sm">
                    <p className="font-medium text-white">{index + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-white/80">
                      <p>A: {q.optionA}</p>
                      <p>B: {q.optionB}</p>
                      <p>C: {q.optionC}</p>
                      <p>D: {q.optionD}</p>
                    </div>
                    <p className="mt-2 text-trivia-pink font-medium">Correct: {q.correctAnswer}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <Button 
                variant="secondary"
                className="w-full"
                onClick={handleDownloadCSV}
                disabled={isUploading}
              >
                Download CSV
              </Button>
              
              <Button 
                variant="primary"
                className="w-full"
                onClick={handleUploadToCloud}
                isLoading={isUploading}
                disabled={isUploading || isUploadComplete}
              >
                {isUploadComplete ? 'Uploaded Successfully' : 'Upload to Supabase'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleStartOver}
                disabled={isUploading}
              >
                Create New Trivia
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="p-6 text-center animate-in fade-in">
        <p className="text-white/60 text-sm">
          Your trivia questions are saved locally until you clear your browser data.
          {isUploadComplete && " They are also available in the cloud for your Raspberry Pi."}
        </p>
      </div>
    </div>
  );
};

export default FinishPage;
