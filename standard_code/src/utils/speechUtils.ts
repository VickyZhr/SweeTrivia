
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
      
      // Create and play an audio element with a base64 encoded silent audio
      // This is to ensure audio can be played later (autoplay policy)
      playSound()
        .then(() => {
          // Since we can't directly call espeak-ng from the browser,
          // we'll use a command that works for RPi kiosk/touchscreen setups
          
          // Create a data URI for the command (technique that works in RPi kiosk mode)
          const escapedText = text.replace(/"/g, '\\"');
          const command = `espeak-ng "${escapedText}" -p 50 -s 150 -a 200`;
          
          // Create an iframe to execute the command (works in kiosk mode with proper setup)
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          
          // Create a unique ID for this speech request
          const speechId = `speech-${Date.now()}`;
          iframe.id = speechId;
          
          // Set up the source with the command URI
          iframe.src = `data:text/html;charset=utf-8,
            <html>
              <head>
                <script>
                  // Create a WebSocket connection to the local espeak-ng helper service
                  // This requires a locally running service on the Raspberry Pi
                  try {
                    const ws = new WebSocket('ws://localhost:8765');
                    
                    ws.onopen = () => {
                      console.log('Connection to speech service established');
                      // Send the text to be spoken
                      ws.send(JSON.stringify({
                        action: 'speak',
                        text: "${escapedText}"
                      }));
                      
                      // Close connection after sending
                      setTimeout(() => {
                        try { ws.close(); } catch(e) {}
                      }, 100);
                    };
                    
                    ws.onerror = (e) => {
                      console.error('WebSocket error:', e);
                      // Try fallback method
                      try {
                        // Fallback: Try to use system commands if available
                        // This depends on browser permissions and kiosk mode settings
                        if (window.parent) {
                          window.parent.postMessage('speech-error', '*');
                        }
                      } catch(err) {
                        console.error('Fallback also failed:', err);
                      }
                    };
                  } catch(e) {
                    console.error('Speech service setup error:', e);
                  }
                  
                  // Signal completion after a timeout based on text length
                  setTimeout(() => {
                    if (window.parent) {
                      window.parent.postMessage('speech-complete', '*');
                    }
                  }, ${Math.max(2000, text.length * 100)});
                </script>
              </head>
              <body></body>
            </html>`;
          
          document.body.appendChild(iframe);
          
          // Set up message listener for completion
          const messageListener = (event: MessageEvent) => {
            if (event.data === 'speech-complete' || event.data === 'speech-error') {
              window.removeEventListener('message', messageListener);
              
              // Remove the iframe after speech is completed or on error
              setTimeout(() => {
                const frameElement = document.getElementById(speechId);
                if (frameElement) {
                  document.body.removeChild(frameElement);
                }
              }, 500);
              
              resolve();
            }
          };
          
          window.addEventListener('message', messageListener);
          
          // Also resolve after a timeout as fallback
          setTimeout(() => {
            resolve();
          }, Math.max(5000, text.length * 100));
        })
        .catch(error => {
          console.error('Error playing initial sound:', error);
          reject(error);
        });
      
    } catch (error) {
      console.error('RPi speech error:', error);
      // Resolve anyway to not block the app
      resolve();
    }
  });
};

// Utility function to play a short sound
// This helps with autoplay policy on browsers
const playSound = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    try {
      // Create a silent audio element and play it
      // This is to satisfy browser autoplay policies
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
      audio.volume = 0.01; // Nearly silent
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = () => {
        console.warn('Error playing silent audio');
        resolve();
      };
      
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.warn('Silent audio play failed:', error);
          resolve();
        });
      }
      
      // Resolve after a short timeout in case events don't fire
      setTimeout(resolve, 500);
    } catch (error) {
      console.warn('Sound player error:', error);
      resolve();
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
      // but we can remove any iframes we created
      const speechFrames = document.querySelectorAll('iframe[id^="speech-"]');
      speechFrames.forEach(frame => {
        document.body.removeChild(frame);
      });
    } else if ('speechSynthesis' in window) {
      // For Web Speech API
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};
