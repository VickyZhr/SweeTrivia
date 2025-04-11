import React, { useEffect } from 'react';
import { speakWithEspeakNg } from '@/utils/speechUtils';

interface NarrationControlProps {
  question: string;
  options: string[];
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
      const narration = `Question: ${question}. Option A: ${options[0]}. Option B: ${options[1]}. Option C: ${options[2]}. Option D: ${options[3]}.`;
      await speakWithEspeakNg(narration);
      if (!isCancelled) {
        onNarrationEnd();
      }
    };

    narrate();

    return () => {
      isCancelled = true;
    };
  }, [question]);

  return null;
};

export default NarrationControl;
