// A utility for handling text-to-speech functionality optimized for Raspberry Pi

// Create a speech synthesis instance safely with fallback mechanism
let synth: SpeechSynthesis | null = null;
let initialized = false;
let isRaspberryPi = false;

// Function to detect if running on Raspberry Pi
const detectRaspberryPi = (): boolean => {
  try {
    // Check for common Raspberry Pi browser indicators
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Look for common Raspberry Pi browser strings
    const raspberryPiIndicators = [
      'linux armv', // Common in RPi user agents
      'raspberry',
      'rpi',
      'linux arm' // Generic ARM Linux
    ];
    
    // Check if the user agent contains any of the indicators
    const isRPi = raspberryPiIndicators.some(indicator => userAgent.includes(indicator));
    
    console.log(`Running on ${isRPi ? 'Raspberry Pi' : 'standard device'}, User Agent: ${navigator.userAgent}`);
    
    return isRPi;
  } catch (error) {
    console.error('Error detecting device type:', error);
    return false;
  }
};

// Initialize speech synthesis safely with RPi-specific adjustments
const initSpeechSynthesis = (): boolean => {
  // If already initialized, don't try again
  if (initialized) return !!synth;
  
  try {
    // Detect if we're running on a Raspberry Pi
    isRaspberryPi = detectRaspberryPi();
    console.log(`Device detection: ${isRaspberryPi ? 'Raspberry Pi' : 'standard device'}`);
    
    // Check if the window object and speechSynthesis exist
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth = window.speechSynthesis;
      
      console.log('Attempting to initialize speech synthesis...');
      
      // On RPi, forcefully cancel any lingering speech
      if (isRaspberryPi) {
        try {
          synth.cancel();
          console.log('Forcefully cancelled any existing speech (RPi optimization)');
          
          // Wait a moment before proceeding with initialization on RPi
          setTimeout(() => {
            console.log('Extra delay before voice loading on RPi');
          }, 500);
        } catch (e) {
          console.warn('Error during initial cancel operation:', e);
        }
      }
      
      // Force initialize the voices on some devices (especially helpful for RPi)
      let voices = synth.getVoices();
      console.log(`Found ${voices.length} voices on first try`);
      
      // On Raspberry Pi, we'll be more aggressive in waiting for voices
      if (voices.length === 0 || isRaspberryPi) {
        console.log(`${voices.length === 0 ? 'No voices found' : 'RPi detected'}, setting up extended retry mechanism`);
        
        // Try to force voice loading multiple times for RPi
        let retryCount = 0;
        const maxRetries = 5;
        
        const retryVoiceLoading = () => {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retry attempt ${retryCount} for voice loading...`);
            
            // Try to get voices again
            voices = synth.getVoices();
            console.log(`Retry ${retryCount}: Found ${voices.length} voices`);
            
            if (voices.length > 0) {
              console.log('Successfully loaded voices on retry!');
              logAvailableVoices(voices);
            } else if (retryCount < maxRetries) {
              // Schedule another retry with increasing delay
              setTimeout(retryVoiceLoading, 500 * retryCount);
            }
          }
        };
        
        // Set up voice change event listener
        window.speechSynthesis.onvoiceschanged = () => {
          const newVoices = synth?.getVoices() || [];
          console.log(`Voices changed event triggered: ${newVoices.length} voices available`);
          logAvailableVoices(newVoices);
        };
        
        // Start the retry process
        setTimeout(retryVoiceLoading, 500);
      } else {
        // Log available voices
        logAvailableVoices(voices);
      }
      
      // Test if speech is working, with special handling for RPi
      testSpeechSynthesis();
      
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

// Helper function to log available voices
const logAvailableVoices = (voices: SpeechSynthesisVoice[]) => {
  if (voices.length > 0) {
    console.log(`Available voices (${voices.length}):`);
    const englishVoices = voices.filter(v => v.lang.includes('en'));
    console.log(`English voices available: ${englishVoices.length}`);
    
    // Log first 5 voices or all if less than 5
    const samplesToLog = Math.min(voices.length, 5);
    for (let i = 0; i < samplesToLog; i++) {
      const v = voices[i];
      console.log(`Voice ${i+1}: ${v.name} (${v.lang}) - ${v.localService ? 'Local' : 'Remote'}`);
    }
  } else {
    console.warn('No voices available to log');
  }
};

// Test speech synthesis to ensure it's working
const testSpeechSynthesis = () => {
  if (!synth) return;
  
  try {
    console.log('Testing speech synthesis...');
    
    // Create a minimal test utterance
    const testUtterance = new SpeechSynthesisUtterance('');
    testUtterance.volume = 1; 
    testUtterance.rate = 1;
    testUtterance.pitch = 1;
    
    // Add event handlers
    testUtterance.onstart = () => console.log('Test utterance started');
    testUtterance.onend = () => console.log('Test utterance completed');
    testUtterance.onerror = (e) => console.error('Test utterance error:', e);
    
    // On RPi, use more careful testing approach
    if (isRaspberryPi) {
      console.log('Using RPi-specific test approach');
      // First cancel any pending speech
      synth.cancel();
      
      // Then try speaking with a tiny delay
      setTimeout(() => {
        synth?.speak(testUtterance);
        // And cancel it immediately after queuing
        setTimeout(() => synth?.cancel(), 200);
      }, 200);
    } else {
      // Standard approach for other devices
      synth.speak(testUtterance);
      synth.cancel(); // Clean up the test
    }
  } catch (error) {
    console.error('Error during speech synthesis test:', error);
  }
};

// Initialize on load
const speechSupported = initSpeechSynthesis();

// Re-attempt initialization after a short delay (helps on some devices)
setTimeout(() => {
  if (!initialized) {
    console.log('Retrying speech synthesis initialization after delay...');
    initSpeechSynthesis();
  }
}, 2000);

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
      const truncatedText = text.length > 30 ? `${text.substring(0, 30)}...` : text;
      console.log(`Preparing to speak: "${truncatedText}"`);
      
      // If speech synthesis is already speaking, cancel it
      if (synth.speaking) {
        console.log('Cancelling ongoing speech before starting new one');
        synth.cancel();
        
        // Small delay after canceling (especially helpful on RPi)
        setTimeout(() => {
          speakText(text, resolve);
        }, isRaspberryPi ? 300 : 100);
      } else {
        speakText(text, resolve);
      }
    } catch (error) {
      console.error('Error during speech synthesis:', error);
      resolve(); // Resolve anyway to not block the app
    }
  });
};

// Helper function to handle the actual speaking
const speakText = (text: string, resolvePromise: () => void) => {
  if (!synth) {
    resolvePromise();
    return;
  }

  try {
    // Create a new utterance with the provided text
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings optimized for Raspberry Pi
    utterance.rate = isRaspberryPi ? 0.8 : 0.85; // Slower rate on RPi for clarity
    utterance.pitch = 1;
    utterance.volume = 1; // Full volume
    
    // Force reload available voices
    const voices = synth.getVoices();
    
    if (voices.length > 0) {
      // Try to find suitable voice with preference order for Raspberry Pi
      let selectedVoice = null;
      
      if (isRaspberryPi) {
        // For RPi, prioritize English voices that are local
        selectedVoice = voices.find(voice => 
          voice.lang.includes('en-US') && voice.localService
        ) || voices.find(voice => 
          voice.lang.includes('en-GB') && voice.localService
        ) || voices.find(voice => 
          voice.lang.includes('en') && voice.localService
        );
      }
      
      // If no voice found yet, try more generic options
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('en-US')
        ) || voices.find(voice => 
          voice.lang.includes('en')
        ) || voices[0]; // Fallback to any voice
      }
      
      if (selectedVoice) {
        console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        utterance.voice = selectedVoice;
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
    
    // Failsafe: If speech doesn't end naturally, resolve after timeout
    // This is particularly important for RPi where speech events sometimes fail
    const timeout = Math.max(5000, text.length * 100);
    const timer = setTimeout(() => {
      console.warn(`Speech timed out after ${timeout}ms, continuing anyway`);
      resolvePromise();
    }, timeout);
    
    utterance.onend = () => {
      clearTimeout(timer);
      console.log('Speech completed successfully');
      resolvePromise();
    };
    
    utterance.onerror = (event) => {
      clearTimeout(timer);
      console.error('Speech synthesis error:', event);
      resolvePromise(); // Resolve anyway to not block the app
    };
    
    // Start speaking
    synth.speak(utterance);
    
    // RPi-specific workarounds
    if (isRaspberryPi) {
      // Handle common issues on RPi browsers
      if (synth.paused) {
        console.log('Speech synthesis was paused, resuming...');
        synth.resume();
      }
      
      // Additional RPi browser hack - forces update in some stuck cases
      setTimeout(() => {
        try {
          if (synth.speaking && !synth.paused) {
            console.log('Applying RPi-specific hack to ensure speech is playing');
            synth.pause();
            synth.resume();
          }
        } catch (e) {
          console.warn('Error during RPi speech hack:', e);
        }
      }, 500);
      
      // Sometimes on RPi, we need an additional nudge
      setTimeout(() => {
        try {
          if (synth.speaking) {
            console.log('Second RPi speech hack applied');
            const currentRate = utterance.rate;
            utterance.rate = currentRate + 0.01; // Tiny change to force update
          }
        } catch (e) {
          console.warn('Error during second RPi speech hack:', e);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error in speakText:', error);
    resolvePromise(); // Resolve anyway to not block the app
  }
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

// Apply RPi-specific fixes on load if needed
if (isRaspberryPi) {
  console.log('Applying Raspberry Pi specific optimizations');
  
  // Fix for some RPi browsers that need periodic "nudging" of the speech system
  let keepAlivePing = setInterval(() => {
    try {
      if (synth && !synth.speaking) {
        // Create and immediately cancel a tiny utterance to keep the system alive
        const pingUtterance = new SpeechSynthesisUtterance('');
        pingUtterance.volume = 0; // Silent
        synth.speak(pingUtterance);
        synth.cancel();
        console.log('RPi speech system ping');
      }
    } catch (e) {
      console.warn('Error during RPi keep-alive ping:', e);
      clearInterval(keepAlivePing); // Stop if it's causing errors
    }
  }, 30000); // Every 30 seconds
}
