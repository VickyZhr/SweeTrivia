
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

// Maximum number of connection attempts
const MAX_CONNECTION_ATTEMPTS = 3;

// Function to speak text using espeak-ng on Raspberry Pi or Web Speech API on other devices
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (runningOnRPi) {
      // On Raspberry Pi, use our custom approach that works with espeak-ng
      console.log('Using Raspberry Pi speech method');
      speakOnRaspberryPi(text, 1)  // Start with attempt #1
        .then(resolve)
        .catch((error) => {
          console.error('Raspberry Pi speech failed:', error);
          reject(new Error('Speech service unavailable. Please check speech server is running.'));
        });
    } else {
      // On standard devices, use Web Speech API
      console.log('Using standard Web Speech API');
      speakWithWebSpeechAPI(text)
        .then(resolve)
        .catch(reject);
    }
  });
};

// Function to speak on Raspberry Pi using a compatible approach with retries
const speakOnRaspberryPi = async (text: string, attemptNumber: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      // For Raspberry Pi, we'll use a method that works with espeak-ng
      // This requires espeak-ng to be installed on the Raspberry Pi
      
      console.log(`RPi speaking (attempt ${attemptNumber}): "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // Check if speech-server.py is running by attempting a connection
      const wsAddress = 'ws://localhost:8765';
      console.log(`Attempting to connect to speech server at ${wsAddress}`);
      const testConnection = new WebSocket(wsAddress);
      let connectionTimeout: number | null = null;
      
      testConnection.onopen = () => {
        console.log('Connection to speech service established - service is running');
        testConnection.close();
        if (connectionTimeout) clearTimeout(connectionTimeout);
        
        // Create and play an audio element with a base64 encoded silent audio
        // This is to ensure audio can be played later (autoplay policy)
        playSound()
          .then(() => {
            // Since we can't directly call espeak-ng from the browser,
            // we'll use a command that works for RPi kiosk/touchscreen setups
            
            const escapedText = text.replace(/"/g, '\\"');
            
            // Create a WebSocket connection to send the text to be spoken
            const ws = new WebSocket(wsAddress);
            
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
        
        // If we haven't exceeded max attempts, try again
        if (attemptNumber < MAX_CONNECTION_ATTEMPTS) {
          console.log(`Retrying connection (attempt ${attemptNumber + 1}/${MAX_CONNECTION_ATTEMPTS})...`);
          if (connectionTimeout) clearTimeout(connectionTimeout);
          testConnection.close();
          
          // Add a small delay between attempts
          setTimeout(() => {
            speakOnRaspberryPi(text, attemptNumber + 1)
              .then(resolve)
              .catch(reject);
          }, 500);
        } else {
          reject(new Error('Speech server connection failed after multiple attempts. Please ensure speech-server.py is running.'));
        }
      };
      
      // Set timeout for connection attempt
      connectionTimeout = window.setTimeout(() => {
        console.error('Connection to speech server timed out. Is speech-server.py running?');
        testConnection.close();
        
        // If we haven't exceeded max attempts, try again
        if (attemptNumber < MAX_CONNECTION_ATTEMPTS) {
          console.log(`Retrying connection (attempt ${attemptNumber + 1}/${MAX_CONNECTION_ATTEMPTS})...`);
          
          // Add a small delay between attempts
          setTimeout(() => {
            speakOnRaspberryPi(text, attemptNumber + 1)
              .then(resolve)
              .catch(reject);
          }, 500);
        } else {
          reject(new Error('Speech server connection timed out after multiple attempts'));
        }
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

// Function to check if speech capabilities are available
export const isSpeechAvailable = async (): Promise<boolean> => {
  if (runningOnRPi) {
    try {
      // Try to connect to the WebSocket server
      return new Promise<boolean>((resolve) => {
        const testConnection = new WebSocket('ws://localhost:8765');
        const connectionTimeout = setTimeout(() => {
          testConnection.close();
          console.error('Speech server connection timed out');
          resolve(false);
        }, 3000);
        
        testConnection.onopen = () => {
          clearTimeout(connectionTimeout);
          testConnection.close();
          console.log('Speech server is available');
          resolve(true);
        };
        
        testConnection.onerror = () => {
          clearTimeout(connectionTimeout);
          console.error('Speech server is not available');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  } else {
    // For standard browsers, check if Web Speech API is available
    return 'speechSynthesis' in window;
  }
};