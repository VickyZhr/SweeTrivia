
// A utility for handling text-to-speech functionality

// Create a speech synthesis instance
const synth = window.speechSynthesis;

// Function to speak text
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    // If speech synthesis is already speaking, cancel it
    if (synth.speaking) {
      synth.cancel();
    }

    // Create a new utterance with the provided text
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Add an event listener to resolve the promise when speech ends
    utterance.onend = () => {
      resolve();
    };
    
    // Start speaking
    synth.speak(utterance);
  });
};

// Function to stop any ongoing speech
export const stopSpeech = (): void => {
  if (synth.speaking) {
    synth.cancel();
  }
};
