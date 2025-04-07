
import React, { useEffect, useState } from 'react';
import { TriviaQuestion } from '@/utils/triviaUtils';
import { useTrivia } from '@/context/TriviaContext';
import { getOptionLetter } from '@/utils/triviaUtils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { speak, stopSpeech, isSpeechAvailable } from '@/utils/speechUtils';
import { toast } from '@/components/ui/use-toast';

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
  
  // State for narration
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationFailed, setNarrationFailed] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Check speech availability on component mount
  useEffect(() => {
    const checkSpeech = async () => {
      try {
        console.log("Checking speech availability...");
        const available = await isSpeechAvailable();
        console.log(`Speech available: ${available}`);
        setSpeechAvailable(available);
        
        if (!available) {
          console.log('Speech functionality is not available');
          setNarrationFailed(true);
          
          // Show a toast if speech server is unavailable
          toast({
            title: "Narration unavailable",
            description: "Please ensure speech server is running",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Narration ready",
            description: "Using Google Cloud TTS for high-quality narration",
          });
        }
      } catch (error) {
        console.error('Error checking speech availability:', error);
        setSpeechAvailable(false);
        setNarrationFailed(true);
        
        toast({
          title: "Speech check failed",
          description: "Could not verify speech capabilities",
          variant: "destructive"
        });
      }
    };
    
    checkSpeech();
  }, []);
  
  // Function to narrate the question and answers with better error handling
  const narrateQuestion = async () => {
    if (speechAvailable === false) {
      setNarrationFailed(true);
      return;
    }
    
    setIsNarrating(true);
    setNarrationFailed(false);
    
    try {
      console.log("Starting narration with Google Cloud TTS...");
      // First narrate the question
      const questionText = `Question: ${question.question}`;
      await speak(questionText);
      
      // Then narrate each option with a small pause between them
      for (let i = 0; i < question.options.length; i++) {
        const optionText = `Option ${getOptionLetter(i)}: ${question.options[i]}`;
        await speak(optionText);
      }
      
      console.log("Narration completed successfully");
      setIsNarrating(false);
    } catch (error) {
      console.error('Error during narration:', error);
      setIsNarrating(false);
      setNarrationFailed(true);
      
      // Show a toast if narration fails
      toast({
        title: "Narration error",
        description: error instanceof Error ? error.message : "Please check speech server status",
        variant: "destructive"
      });
    }
  };
  
  // When a new question is loaded or when retry is triggered, narrate it
  useEffect(() => {
    const startNarration = async () => {
      if (speechAvailable === true) {
        try {
          await narrateQuestion();
        } catch (error) {
          console.error('Narration error:', error);
          setIsNarrating(false);
          setNarrationFailed(true);
        }
      }
    };
    
    // Reset narration status when question changes
    setNarrationFailed(false);
    
    // Only start narration if speech has been checked and is available
    if (speechAvailable !== null) {
      console.log(`Starting narration with retry count: ${retryCount}`);
      startNarration();
    }
    
    // Cleanup: stop any ongoing speech when component unmounts or question changes
    return () => {
      stopSpeech();
    };
  }, [question, speechAvailable, retryCount]);
  
  useEffect(() => {
    // Only countdown if:
    // 1. User hasn't answered current question
    // 2. There's still time left
    // 3. Game isn't over
    // 4. Narration is complete or failed, or speech is unavailable
    if (!hasAnswered && timeLeft > 0 && !isGameOver && 
        (!isNarrating || narrationFailed || speechAvailable === false)) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Auto-select an empty answer when time runs out
            selectAnswer('');
            // Set timeUp to true to show the RoundUp screen
            setTimeUp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Clear timer if component unmounts or conditions change
      return () => clearInterval(timer);
    }
  }, [hasAnswered, timeLeft, isGameOver, selectAnswer, setTimeLeft, setTimeUp, isNarrating, narrationFailed, speechAvailable]);

  // Add a new effect to automatically advance to the next question after answer selection
  useEffect(() => {
    let autoAdvanceTimer: NodeJS.Timeout | null = null;
    
    if (hasAnswered && selectedAnswer !== null && !timeUp) {
      // Set a timeout to automatically move to the next question after 2 seconds
      autoAdvanceTimer = setTimeout(() => {
        goToNextQuestion();
      }, 2000);
    }
    
    // Clear the timer if component unmounts or conditions change
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [hasAnswered, goToNextQuestion, selectedAnswer, timeUp]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Improved function to retry narration with connection retry
  const handleRetryNarration = async () => {
    try {
      // Stop any current speech first
      stopSpeech();
      setConnectionAttempts(prev => prev + 1);
      
      // Show attempting toast
      toast({
        title: "Checking speech server",
        description: "Attempting to connect...",
      });
      
      // First check if speech is available now
      const available = await isSpeechAvailable();
      setSpeechAvailable(available);
      
      if (available) {
        setNarrationFailed(false);
        toast({
          title: "Connection successful",
          description: "Starting narration with Google Cloud TTS...",
        });
        
        // Increment retry count to trigger the narration effect
        setRetryCount(prev => prev + 1);
      } else {
        toast({
          title: "Speech server unavailable",
          description: "Please ensure speech server is running",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error retrying narration:', error);
      toast({
        title: "Narration retry failed",
        description: error instanceof Error ? error.message : "Please check speech server status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-hot-pink p-6">
        {/* Timer and Score */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-black font-mono text-4xl font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="text-black font-mono text-4xl font-bold">
            Score: + {score}
          </div>
        </div>
        
        {/* Question - Updated with white outline styling similar to Select Category */}
        <h2 className="text-center text-3xl md:text-5xl mb-10 font-mono text-green-800 tracking-wide pixel-text-lg"
            style={{ 
              textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff'
            }}>
          {question.question}
          <span className="ml-2">🦑</span>
        </h2>
        
        {/* Narration indicator - Updated with larger font */}
        {isNarrating && (
          <div className="flex justify-center items-center mb-6">
            <div className="bg-yellow-300/80 text-green-800 px-6 py-3 rounded-xl font-bold animate-pulse text-2xl md:text-3xl">
              Narrating with Google TTS... Please wait
            </div>
          </div>
        )}
        
        {/* Narration failed indicator with retry button */}
        {narrationFailed && (
          <div className="flex flex-col justify-center items-center mb-6">
            <div className="bg-red-300/80 text-green-800 px-6 py-3 rounded-xl font-bold text-2xl md:text-3xl mb-2">
              Text-to-speech unavailable
            </div>
            <Button 
              onClick={handleRetryNarration}
              className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold px-4 py-2 rounded-full"
            >
              Retry Narration
            </Button>
          </div>
        )}
        
        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !hasAnswered && (!isNarrating || narrationFailed) && selectAnswer(option)}
              disabled={hasAnswered || (isNarrating && !narrationFailed)}
              className={`
                w-full py-5 px-6 rounded-full border-4 border-white
                font-mono text-2xl font-bold text-center
                ${hasAnswered && option === question.correctAnswer 
                  ? 'bg-green-400' 
                  : hasAnswered && selectedAnswer === option && option !== question.correctAnswer
                    ? 'bg-red-400'
                    : selectedAnswer === option
                      ? 'bg-yellow-300/90'
                      : isNarrating && !narrationFailed
                        ? 'bg-yellow-300/50 cursor-not-allowed'
                        : 'bg-yellow-300 hover:bg-yellow-300/90'}
                transition-all duration-300
              `}
            >
              <span className="block">{getOptionLetter(index)}. {option}</span>
            </button>
          ))}
        </div>
        
        {/* Next question indicator - Updated with larger font */}
        {hasAnswered && selectedAnswer !== null && (
          <div className="flex justify-center items-center mt-4">
            <div className="bg-yellow-300/80 text-green-800 px-6 py-3 rounded-xl font-bold animate-pulse text-2xl md:text-3xl">
              Next question in 2 seconds...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaCard;
