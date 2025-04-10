
import React from 'react';

const GameInstructions: React.FC = () => {
  return (
    <div className="text-white bg-black/50 backdrop-blur-sm p-4 rounded-lg max-w-xs">
      <h3 className="font-bold mb-2">How to Play:</h3>
      <ul className="list-disc pl-5 text-xs">
        <li>Press SPACE or click to make the bird jump</li>
        <li>Fly through the gap with the correct answer</li>
        <li>Get 10 points for each correct answer</li>
        <li>You have 3 lives - don't hit the pipes or boundaries!</li>
      </ul>
    </div>
  );
};

export default GameInstructions;
