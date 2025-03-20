
import React, { useEffect, useState, useRef } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { TriviaQuestion } from '@/utils/triviaUtils';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioNarratorProps {
  question: TriviaQuestion;
}

const AudioNarrator: React.FC<AudioNarratorProps> = ({ question }) => {
  const { setIsNarrating } = useTrivia();
  const [currentlyNarrating, setCurrentlyNarrating] = useState<'question' | 'options' | 'none'>('question');
  const synth = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [synthAvailable, setSynthAvailable] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const addDebugMessage = (message: string) => {
    console.log(`AudioNarrator: ${message}`);
    setDebugMessages(prev => [...prev, message]);
  };

  // Initialize speech synthesis
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        synth.current = window.speechSynthesis;
        addDebugMessage('Speech synthesis initialized');
      } else {
        addDebugMessage('Speech synthesis not available in this browser');
        setSynthAvailable(false);
        setIsNarrating(false);
      }
    } catch (error) {
      addDebugMessage(`Error initializing speech synthesis: ${error}`);
      setSynthAvailable(false);
      setIsNarrating(false);
    }

    // Clean up
    return () => {
      if (synth.current) {
        try {
          synth.current.cancel();
          addDebugMessage('Speech synthesis cancelled on cleanup');
        } catch (error) {
          addDebugMessage(`Error cancelling speech: ${error}`);
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setIsNarrating]);

  // Test speech synthesis capability
  useEffect(() => {
    if (!synth.current) return;

    try {
      // Test if synthesis is actually working
      const testUtterance = new SpeechSynthesisUtterance('test');
      testUtterance.volume = 1;
      testUtterance.rate = 1;
      testUtterance.pitch = 1;
      addDebugMessage('Testing speech synthesis capability...');
      
      // List available voices
      const voices = synth.current.getVoices();
      addDebugMessage(`Available voices: ${voices.length}`);
      
      // Set a fallback timeout in case speech synthesis hangs
      const checkTimeout = setTimeout(() => {
        addDebugMessage('Speech synthesis check timed out');
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
        addDebugMessage('Speech synthesis test successful');
        setSynthAvailable(true);
      };
      
      testUtterance.onerror = (event) => {
        clearTimeout(checkTimeout);
        addDebugMessage(`Speech synthesis test error: ${event.error}`);
        setSynthAvailable(false);
        toast({
          title: "Audio narration error",
          description: "There was an error with speech synthesis. Playing without narration.",
          variant: "destructive"
        });
        setIsNarrating(false);
      };
      
      // Force voices to load first (helps on some browsers)
      synth.current.getVoices();
      
      // Add a brief delay before speaking test
      setTimeout(() => {
        try {
          synth.current?.speak(testUtterance);
        } catch (error) {
          addDebugMessage(`Error in speak test: ${error}`);
          clearTimeout(checkTimeout);
          setSynthAvailable(false);
          setIsNarrating(false);
        }
      }, 500);
      
    } catch (error) {
      addDebugMessage(`Error testing speech synthesis: ${error}`);
      setSynthAvailable(false);
      setIsNarrating(false);
    }
  }, [setIsNarrating]);

  // Handle narration when question changes
  useEffect(() => {
    if (!question || !synthAvailable || !synth.current) return;
    
    addDebugMessage(`Starting narration for question: ${question.question.substring(0, 20)}...`);
    
    // Start narrating the question
    setCurrentlyNarrating('question');
    setIsNarrating(true);
    
    // Clear any existing speech and timeouts
    try {
      synth.current.cancel();
    } catch (error) {
      addDebugMessage(`Error cancelling speech: ${error}`);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Create utterance for the question
    const questionUtterance = new SpeechSynthesisUtterance(question.question);
    questionUtterance.rate = 1.0; // Normal speed for better compatibility
    questionUtterance.volume = 1; // Maximum volume
    
    // Set a fallback timeout in case speech synthesis hangs
    const questionTimeout = setTimeout(() => {
      addDebugMessage('Question narration timed out, moving to options');
      handleOptionsNarration();
    }, 15000); // 15 seconds should be enough for most questions
    
    timeoutRef.current = questionTimeout;
    
    // When question narration ends, start narrating options
    questionUtterance.onend = () => {
      addDebugMessage('Question narration completed');
      clearTimeout(questionTimeout);
      handleOptionsNarration();
    };
    
    // Handle errors
    questionUtterance.onerror = (event) => {
      addDebugMessage(`Question narration error: ${event.error}`);
      clearTimeout(questionTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
      toast({
        title: "Narration error",
        description: "There was an error with speech synthesis. Continuing without narration.",
        variant: "destructive"
      });
    };
    
    // Start narrating the question (with a slight delay to ensure everything is ready)
    setTimeout(() => {
      try {
        addDebugMessage('Attempting to speak question');
        synth.current?.speak(questionUtterance);
      } catch (error) {
        addDebugMessage(`Error speaking question: ${error}`);
        clearTimeout(questionTimeout);
        setCurrentlyNarrating('none');
        setIsNarrating(false);
      }
    }, 100);
    
  }, [question, setIsNarrating, synthAvailable]);

  // Handle options narration
  const handleOptionsNarration = () => {
    if (!synth.current || !question) return;
    
    setCurrentlyNarrating('options');
    addDebugMessage('Starting options narration');
    
    // Prepare options text
    const optionsText = question.options.map((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      return `Option ${letter}: ${option}`;
    }).join('. ');
    
    const optionsUtterance = new SpeechSynthesisUtterance(optionsText);
    optionsUtterance.rate = 1.0;
    optionsUtterance.volume = 1;
    
    // Set a fallback timeout in case options narration hangs
    const optionsTimeout = setTimeout(() => {
      addDebugMessage('Options narration timed out, ending narration');
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    }, 20000); // 20 seconds should be enough for options
    
    timeoutRef.current = optionsTimeout;
    
    // When options narration ends, narration is complete
    optionsUtterance.onend = () => {
      addDebugMessage('Options narration completed');
      clearTimeout(optionsTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    };
    
    // Handle errors
    optionsUtterance.onerror = (event) => {
      addDebugMessage(`Options narration error: ${event.error}`);
      clearTimeout(optionsTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    };
    
    // Speak the options
    try {
      synth.current.speak(optionsUtterance);
    } catch (error) {
      addDebugMessage(`Error speaking options: ${error}`);
      clearTimeout(optionsTimeout);
      setCurrentlyNarrating('none');
      setIsNarrating(false);
    }
  };

  // Toggle debug info visibility
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  return (
    <div>
      {/* Hidden element for accessibility */}
      <div className="sr-only">
        {currentlyNarrating === 'question' && <span>Narrating question...</span>}
        {currentlyNarrating === 'options' && <span>Narrating options...</span>}
        {!synthAvailable && <span>Narration unavailable on this device</span>}
      </div>
      
      {/* Debug button - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={toggleDebugInfo}
          className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs px-2 py-1 rounded z-50"
        >
          {showDebugInfo ? 'Hide' : 'Show'} Audio Debug
        </button>
      )}
      
      {/* Debug information panel */}
      {showDebugInfo && (
        <div className="fixed bottom-16 left-4 w-80 max-h-96 overflow-auto bg-gray-800 text-white text-xs p-2 rounded z-50">
          <h4 className="font-bold mb-1">Audio Narrator Debug</h4>
          <p>Status: {synthAvailable ? 'Available' : 'Unavailable'}</p>
          <p>Current: {currentlyNarrating}</p>
          <div className="mt-2">
            <h5 className="font-bold">Log:</h5>
            {debugMessages.map((msg, i) => (
              <div key={i} className="text-xs text-gray-300 mt-1">{msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioNarrator;