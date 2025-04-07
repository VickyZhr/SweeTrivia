
// A utility for handling text-to-speech functionality optimized for Raspberry Pi

// Detect if running on Raspberry Pi
const isRaspberryPi = (): boolean => {
  try {
    // Check for common Raspberry Pi browser indicators
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Look for common Raspberry Pi browser strings
    const raspberryPiIndicators = [
      'linux armv',
      'raspberry',
      'rpi',
      'linux arm'
    ];
    
    const isRPi = raspberryPiIndicators.some(indicator => userAgent.includes(indicator));
    console.log(`Running on ${isRPi ? 'Raspberry Pi' : 'standard device'}, User Agent: ${navigator.userAgent}`);
    
    return isRPi;
  } catch (error) {
    console.error('Error detecting device type:', error);
    return false;
  }
};

// Check if we're running on a Raspberry Pi
const runningOnRPi = isRaspberryPi();

// Function to speak text using espeak-ng on Raspberry Pi or Web Speech API on other devices
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (runningOnRPi) {
      // On Raspberry Pi, use our custom approach that works with espeak-ng
      console.log('Using Raspberry Pi speech method');
      speakOnRaspberryPi(text)
        .then(resolve)
        .catch(reject);
    } else {
      // On standard devices, use Web Speech API
      console.log('Using standard Web Speech API');
      speakWithWebSpeechAPI(text)
        .then(resolve)
        .catch(reject);
    }
  });
};

// Function to speak on Raspberry Pi using a compatible approach
const speakOnRaspberryPi = async (text: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      // For Raspberry Pi, we'll use a method that works with espeak-ng
      // This requires espeak-ng to be installed on the Raspberry Pi
      
      console.log(`RPi speaking: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // Check if speech-server.py is running by attempting a connection
      const testConnection = new WebSocket('ws://localhost:8765');
      let connectionTimeout: number | null = null;
      
      testConnection.onopen = () => {
        console.log('Connection to speech service established - service is running');
        testConnection.close();
        clearTimeout(connectionTimeout!);
        
        // Create and play an audio element with a base64 encoded silent audio
        // This is to ensure audio can be played later (autoplay policy)
        playSound()
          .then(() => {
            // Since we can't directly call espeak-ng from the browser,
            // we'll use a command that works for RPi kiosk/touchscreen setups
            
            const escapedText = text.replace(/"/g, '\\"');
            
            // Create a WebSocket connection to send the text to be spoken
            const ws = new WebSocket('ws://localhost:8765');
            
            ws.onopen = () => {
              console.log('Speech WebSocket connected, sending text to speak');
              ws.send(JSON.stringify({
                action: 'speak',
                text: escapedText
              }));
              
              // Close connection after sending
              setTimeout(() => {
                try { 
                  ws.close(); 
                  console.log('Speech WebSocket closed after sending');
                } catch(e) {
                  console.error('Error closing WebSocket:', e);
                }
              }, 300);
            };
            
            ws.onerror = (e) => {
              console.error('WebSocket error during speech:', e);
              reject(new Error('WebSocket error during speech'));
            };
            
            // Assume speech completed based on text length (fallback timing)
            const estimatedDuration = Math.max(2000, text.length * 100);
            console.log(`Estimated speech duration: ${estimatedDuration}ms`);
            setTimeout(() => {
              resolve();
            }, estimatedDuration);
          })
          .catch(error => {
            console.error('Error playing initial sound:', error);
            reject(error);
          });
      };
      
      testConnection.onerror = (event) => {
        console.error('Error connecting to speech server. Is speech-server.py running?', event);
        reject(new Error('Speech server connection failed. Please ensure speech-server.py is running.'));
      };
      
      // Set timeout for connection attempt
      connectionTimeout = window.setTimeout(() => {
        console.error('Connection to speech server timed out. Is speech-server.py running?');
        testConnection.close();
        reject(new Error('Speech server connection timed out'));
      }, 3000);
      
    } catch (error) {
      console.error('RPi speech error:', error);
      reject(error);
    }
  });
};

// Utility function to play a short sound
// This helps with autoplay policy on browsers
const playSound = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create a silent audio element and play it
      // This is to satisfy browser autoplay policies
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
      audio.volume = 0.01; // Nearly silent
      
      audio.onended = () => {
        console.log('Silent sound played successfully');
        resolve();
      };
      
      audio.onerror = (e) => {
        console.warn('Error playing silent audio:', e);
        resolve(); // Continue anyway
      };
      
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.warn('Silent audio play failed:', error);
          resolve(); // Continue anyway
        });
      }
      
      // Resolve after a short timeout in case events don't fire
      setTimeout(() => {
        resolve();
      }, 500);
    } catch (error) {
      console.warn('Sound player error:', error);
      resolve(); // Continue anyway
    }
  });
};

// Function to speak text using Web Speech API
const speakWithWebSpeechAPI = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      const synth = window.speechSynthesis;
      
      // Cancel any ongoing speech
      if (synth.speaking) {
        synth.cancel();
      }
      
      console.log(`Speaking: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to find a good voice
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-US')
        ) || voices.find(voice => 
          voice.lang.includes('en')
        ) || voices[0];
        
        utterance.voice = englishVoice;
      }
      
      // Add event listeners
      utterance.onend = () => {
        console.log('Speech completed');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        reject(new Error('Speech synthesis error'));
      };
      
      // Failsafe: If speech doesn't end naturally, resolve after timeout
      const timeout = Math.max(5000, text.length * 100);
      const timer = setTimeout(() => {
        console.warn(`Speech timed out after ${timeout}ms`);
        resolve();
      }, timeout);
      
      // Start speaking
      synth.speak(utterance);
    } catch (error) {
      console.error('Error in Web Speech API:', error);
      reject(error);
    }
  });
};

// Function to stop any ongoing speech
export const stopSpeech = (): void => {
  try {
    if (runningOnRPi) {
      // For Raspberry Pi, we can't directly stop espeak-ng from the browser
      // but we can try to send a stop command to our WebSocket server
      try {
        const ws = new WebSocket('ws://localhost:8765');
        ws.onopen = () => {
          ws.send(JSON.stringify({
            action: 'stop'
          }));
          setTimeout(() => ws.close(), 100);
        };
      } catch (e) {
        console.warn('Could not send stop command to speech server:', e);
      }
    } else if ('speechSynthesis' in window) {
      // For Web Speech API
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};