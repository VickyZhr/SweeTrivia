
import React, { useEffect, useState, useRef } from 'react';
import { useTrivia } from '@/context/TriviaContext';
import { TriviaQuestion } from '@/utils/triviaUtils';

interface AudioNarratorProps {
  question: TriviaQuestion;
}

const AudioNarrator: React.FC<AudioNarratorProps> = ({ question }) => {
  const { setIsNarrating } = useTrivia();
  const [currentlyNarrating, setCurrentlyNarrating] = useState<'question' | 'options' | 'none'>('question');
  const synth = useRef(window.speechSynthesis);
  const timeoutRef = useRef<number | null>(null);

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
    if (!question) return;
    
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
    
    // When question narration ends, start narrating options
    questionUtterance.onend = () => {
      setCurrentlyNarrating('options');
      
      // Prepare options text
      const optionsText = question.options.map((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        return `Option ${letter}: ${option}`;
      }).join('. ');
      
      const optionsUtterance = new SpeechSynthesisUtterance(optionsText);
      optionsUtterance.rate = 1.1;
      
      // When options narration ends, narration is complete
      optionsUtterance.onend = () => {
        setCurrentlyNarrating('none');
        setIsNarrating(false);
      };
      
      // Speak the options
      synth.current.speak(optionsUtterance);
    };
    
    // Start narrating the question
    synth.current.speak(questionUtterance);
    
  }, [question, setIsNarrating]);

  return (
    <div className="sr-only">
      {/* Hidden element for accessibility */}
      {currentlyNarrating === 'question' && <span>Narrating question...</span>}
      {currentlyNarrating === 'options' && <span>Narrating options...</span>}
    </div>
  );
};

export default AudioNarrator;