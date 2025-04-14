import React, { useEffect } from 'react';
import { speakWithEspeakNg } from '@/utils/speechUtils';

interface NarrationControlProps {
  question: string;
  options: { [key: string]: string };
  onNarrationEnd: () => void;
}

const NarrationControl: React.FC<NarrationControlProps> = ({
  question,
  options,
  onNarrationEnd,
}) => {
  useEffect(() => {
    let isCancelled = false;

    const narrate = async () => {
      const letters = ['A', 'B', 'C', 'D'];
      const narration = `Question: ${question}. ` + letters
        .map((letter) => `Option ${letter}: ${options[letter] || '...'}.`)
        .join(' ');

      await speakWithEspeakNg(narration);
      if (!isCancelled) {
        onNarrationEnd();
      }
    };

    narrate();

    return () => {
      isCancelled = true;
    };
  }, [question, options, onNarrationEnd]);

  return null;
};

export default NarrationControl;
