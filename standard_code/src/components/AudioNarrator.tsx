
import React, { useEffect, useState, useRef } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { TriviaQuestion } from '@/utils/triviaUtils';
import { toast } from '@/components/ui/use-toast';

interface AudioNarratorProps {
  question: TriviaQuestion;
}

const AudioNarrator: React.FC<AudioNarratorProps> = ({ question }) => {
  const { setIsNarrating } = useTrivia();
  const [currentlyNarrating, setCurrentlyNarrating] = useState<'question' | 'options' | 'none'>('question');
  const synth = useRef(window.speechSynthesis);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [synthAvailable, setSynthAvailable] = useState(true);

  // Check if speech synthesis is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        // Test if synthesis is actually working
        const testUtterance = new SpeechSynthesisUtterance('test');
        console.log('Testing speech synthesis capability...');
        
        // Set a fallback timeout in case speech synthesis hangs
        const checkTimeout = setTimeout(() => {
          console.log('Speech synthesis check timed out');
          setSynthAvailable(false);
          toast({
            title: "Audio narration unavailable",
            description: "Your device doesn't support speech synthesis properly. Playing without narration.",
            variant: "destructive"
          });
          setIsNarrating(false);
        }, 3000);
        
        testUtterance.onend = () => {
          clearTimeout(checkTimeout);
          console.log('Speech synthesis is available and working');
          setSynthAvailable(true);
        };
        
        testUtterance.onerror = (event) => {
          clearTimeout(checkTimeout);
          console.error('Speech synthesis test error:', event);
          setSynthAvailable(false);
          toast({
            title: "Audio narration error",
            description: "There was an error with speech synthesis. Playing without narration.",
            variant: "destructive"
          });
          setIsNarrating(false);
        };
        
        window.speechSynthesis.speak(testUtterance);
      } catch (error) {
        console.error('Error testing speech synthesis:', error);
        setSynthAvailable(false);
        setIsNarrating(false);
      }
    } else {
      console.error('Speech synthesis not available');
      setSynthAvailable(false);
      setIsNarrating(false);
    }
  }, [setIsNarrating]);

  // Clean up any ongoing speech and timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle narration when question changes
  useEffect(() => {
    if (!question || !synthAvailable) return;
    
    // Start narrating the question
    setCurrentlyNarrating('question');
    setIsNarrating(true);
    
    // Clear any existing speech and timeouts
    synth.current.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Create utterance for the question
    const questionUtterance = new SpeechSynthesisUtterance(question.question);
    questionUtterance.rate = 1.1; // Slightly faster than normal
    
    // Set a fallback timeout in case speech synthesis hangs
    const questionTimeout = setTimeout(() => {
      console.log('Question narration timed out, moving to options');
      handleOptionsNarration();
    }, 10000); // 10 seconds should be enough for most questions
    
    timeoutRef.current = questionTimeout;
    
    // When question narration ends, start narrating options
    questionUtterance.onend = () => {
      clearTimeout(questionTimeout);
      handleOptionsNarration();
    };
    
    // Handle errors
    questionUtterance.onerror = (event) => {
      console.error('Question narration error:', event);
      clearTimeout(questionTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
      toast({
        title: "Narration error",
        description: "There was an error with speech synthesis. Continuing without narration.",
        variant: "destructive"
      });
    };
    
    // Start narrating the question
    synth.current.speak(questionUtterance);
    
  }, [question, setIsNarrating, synthAvailable]);

  // Handle options narration
  const handleOptionsNarration = () => {
    setCurrentlyNarrating('options');
    
    // Prepare options text
    const optionsText = question.options.map((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      return `Option ${letter}: ${option}`;
    }).join('. ');
    
    const optionsUtterance = new SpeechSynthesisUtterance(optionsText);
    optionsUtterance.rate = 1.1;
    
    // Set a fallback timeout in case options narration hangs
    const optionsTimeout = setTimeout(() => {
      console.log('Options narration timed out, ending narration');
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    }, 15000); // 15 seconds should be enough for options
    
    timeoutRef.current = optionsTimeout;
    
    // When options narration ends, narration is complete
    optionsUtterance.onend = () => {
      clearTimeout(optionsTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    };
    
    // Handle errors
    optionsUtterance.onerror = (event) => {
      console.error('Options narration error:', event);
      clearTimeout(optionsTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    };
    
    // Speak the options
    synth.current.speak(optionsUtterance);
  };

  return (
    <div className="sr-only">
      {/* Hidden element for accessibility */}
      {currentlyNarrating === 'question' && <span>Narrating question...</span>}
      {currentlyNarrating === 'options' && <span>Narrating options...</span>}
      {!synthAvailable && <span>Narration unavailable on this device</span>}
    </div>
  );
};

export default AudioNarrator;