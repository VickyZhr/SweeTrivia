
// A utility for handling text-to-speech functionality optimized for Raspberry Pi

// Create a speech synthesis instance safely with fallback mechanism
let synth: SpeechSynthesis | null = null;
let initialized = false;

// Initialize speech synthesis safely
const initSpeechSynthesis = (): boolean => {
  // If already initialized, don't try again
  if (initialized) return !!synth;
  
  try {
    // Check if the window object and speechSynthesis exist
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth = window.speechSynthesis;
      
      console.log('Attempting to initialize speech synthesis...');
      
      // Force initialize the voices on some devices (especially helpful for RPi)
      const voices = synth.getVoices();
      console.log(`Found ${voices.length} voices on first try`);
      
      // On some devices (especially RPi), getVoices() might return empty array on first call
      // We'll set up a retry mechanism
      if (voices.length === 0) {
        console.log('No voices found on first try, setting up retry mechanism');
        
        // Set a flag to try again when voices change
        window.speechSynthesis.onvoiceschanged = () => {
          const newVoices = synth?.getVoices() || [];
          console.log(`Voices loaded on retry: ${newVoices.length}`);
        };
      }
      
      // Quick test to see if speech synthesis is actually working
      const testUtterance = new SpeechSynthesisUtterance('');
      testUtterance.volume = 1; // Max volume for better detection
      testUtterance.onstart = () => console.log('Test utterance started');
      testUtterance.onend = () => console.log('Test utterance completed');
      testUtterance.onerror = (e) => console.error('Test utterance error:', e);
      
      synth.speak(testUtterance);
      synth.cancel(); // Clean up the test
      
      console.log('Speech synthesis initialized successfully');
      initialized = true;
      return true;
    } else {
      console.error('Speech synthesis not supported in this browser/device');
      return false;
    }
  } catch (error) {
    console.error('Error initializing speech synthesis:', error);
    return false;
  }
};

// Initialize on load
const speechSupported = initSpeechSynthesis();

// Function to speak text with improved reliability for Raspberry Pi
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    // If speech synthesis is not available or not initialized, retry initialization once
    if (!speechSupported || !synth) {
      console.warn('Speech synthesis not available, attempting re-initialization...');
      
      if (initSpeechSynthesis() && synth) {
        console.log('Re-initialization successful, continuing with speech');
      } else {
        console.error('Speech synthesis still not available after retry, skipping speech');
        resolve();
        return;
      }
    }

    try {
      console.log(`Preparing to speak: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // If speech synthesis is already speaking, cancel it
      if (synth.speaking) {
        console.log('Cancelling ongoing speech before starting new one');
        synth.cancel();
      }

      // Create a new utterance with the provided text
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings optimized for Raspberry Pi Bluetooth speakers
      utterance.rate = 0.85; // Slightly slower rate for clarity on Bluetooth
      utterance.pitch = 1;
      utterance.volume = 1; // Full volume for better Bluetooth performance
      
      // Force reload available voices (helps on RPi devices)
      const voices = synth.getVoices();
      console.log(`Available voices: ${voices.length}`);
      
      if (voices.length > 0) {
        // Try to use a standard voice if available, prioritizing local ones
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.localService
        ) || voices.find(voice => 
          voice.lang.includes('en')
        ) || voices[0]; // Fallback to any voice if no English voice is found
        
        if (englishVoice) {
          console.log(`Selected voice: ${englishVoice.name} (${englishVoice.lang})`);
          utterance.voice = englishVoice;
        } else {
          console.log('No specific voice selected, using default');
        }
      } else {
        console.warn('No voices available, using default system voice');
      }
      
      // Add event listeners to handle different scenarios
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        console.log('Speech completed successfully');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        resolve(); // Resolve anyway to not block the app
      };
      
      // Failsafe: If speech doesn't end naturally, resolve after text length * 100ms
      // This ensures the promise always resolves even if speech events fail
      const timeout = Math.max(5000, text.length * 100);
      const timer = setTimeout(() => {
        console.warn(`Speech timed out after ${timeout}ms, continuing anyway`);
        resolve();
      }, timeout);
      
      utterance.onend = () => {
        clearTimeout(timer);
        console.log('Speech completed successfully');
        resolve();
      };
      
      // Start speaking
      synth.speak(utterance);
      
      // Some browsers/devices (especially RPi browsers) need this to actually start speaking
      if (synth.paused) {
        console.log('Speech synthesis was paused, resuming...');
        synth.resume();
      }
      
      // Additional hack for some RPi browsers that might get stuck
      setTimeout(() => {
        if (synth.speaking && !synth.paused) {
          console.log('Applying hack to ensure speech is playing');
          synth.pause();
          synth.resume();
        }
      }, 500);
    } catch (error) {
      console.error('Error during speech synthesis:', error);
      resolve(); // Resolve anyway to not block the app
    }
  });
};

// Function to stop any ongoing speech
export const stopSpeech = (): void => {
  if (speechSupported && synth) {
    try {
      if (synth.speaking) {
        console.log('Stopping ongoing speech');
        synth.cancel();
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }
};
