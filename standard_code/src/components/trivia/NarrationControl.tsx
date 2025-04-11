
// import React from 'react';

// // This component is now empty as narration functionality has been removed
// const NarrationControl: React.FC = () => {
//   return null;
// };

// export default NarrationControl;

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
    const narrate = async () => {
      const narration = `Question: ${question}. Option A: ${options[0]}. Option B: ${options[1]}. Option C: ${options[2]}. Option D: ${options[3]}.`;
      await speakWithEspeakNg(narration);
      onNarrationEnd();
    };

    narrate();
  }, [question, options, onNarrationEnd]);

  return null;
};

export default NarrationControl;
