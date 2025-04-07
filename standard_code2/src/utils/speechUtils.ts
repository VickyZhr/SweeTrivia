
// A utility for handling text-to-speech functionality using Google Cloud TTS for both web and Raspberry Pi

// Detect if running on Raspberry Pi with improved detection methods
const isRaspberryPi = (): boolean => {
  try {
    // Check for common Raspberry Pi browser indicators
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Enhanced list of Raspberry Pi indicators
    const raspberryPiIndicators = [
      'linux armv',
      'raspberry',
      'rpi',
      'linux arm',
      'aarch64'
    ];
    
    // Check for URL parameters that can force Raspberry Pi mode
    const urlParams = new URLSearchParams(window.location.search);
    const forceRPiMode = urlParams.get('rpi_mode') === 'true';
    
    // Check for a specific localStorage flag that can be set for Raspberry Pi mode
    const storedRPiMode = localStorage.getItem('rpi_mode') === 'true';
    
    // Raspberry Pi detection using multiple methods
    const isRPi = 
      raspberryPiIndicators.some(indicator => userAgent.includes(indicator)) || 
      forceRPiMode || 
      storedRPiMode ||
      // Simple check for Chromium on Linux which is common for RPi kiosk setups
      (userAgent.includes('linux') && userAgent.includes('chromium'));
    
    console.log(`Speech mode: ${isRPi ? 'Raspberry Pi' : 'Web browser'} (both using Google Cloud TTS)`);
    console.log(`User Agent: ${navigator.userAgent}`);
    
    return isRPi;
  } catch (error) {
    console.error('Error detecting device type:', error);
    // If detection fails, default to assuming it's NOT a Raspberry Pi for safety
    return false;
  }
};

// Check if we're running on a Raspberry Pi
const runningOnRPi = isRaspberryPi();

// Force Raspberry Pi mode function - can be used via browser console
// This allows you to manually override the detection for testing or troubleshooting
(window as any).forceRaspberryPiMode = function(enable = true) {
  localStorage.setItem('rpi_mode', enable ? 'true' : 'false');
  console.log(`Raspberry Pi mode ${enable ? 'enabled' : 'disabled'}. Please refresh the page.`);
};

// Maximum number of connection attempts
const MAX_CONNECTION_ATTEMPTS = 3;

// WebSocket ports to try (in order)
const WEBSOCKET_PORTS = [8765, 8766, 8767, 8768, 8769, 8770];

// Google Cloud TTS API endpoint (to be used via server proxy)
const GOOGLE_TTS_API_ENDPOINT = '/api/tts'; // This will be proxied through our server

// Function to speak text using Google Cloud TTS
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (runningOnRPi) {
      // On Raspberry Pi, use our WebSocket server to handle Google Cloud TTS API calls
      console.log('Using Raspberry Pi with Google Cloud TTS');
      speakViaRpiServer(text)
        .then(resolve)
        .catch((error) => {
          console.error('Raspberry Pi speech failed:', error);
          reject(new Error('Speech service unavailable. Please check speech server is running.'));
        });
    } else {
      // On standard browsers, we'll use Google Cloud TTS via client-side API call
      console.log('Using browser with Google Cloud TTS');
      speakViaGoogleTTS(text)
        .then(resolve)
        .catch((error) => {
          // Fall back to Web Speech API if Google Cloud TTS fails
          console.warn('Google Cloud TTS failed, falling back to Web Speech API:', error);
          speakWithWebSpeechAPI(text)
            .then(resolve)
            .catch(reject);
        });
    }
  });
};

// Try to connect to the WebSocket server on different ports
const tryConnectToWebSocketServer = async (attemptNumber: number = 1): Promise<WebSocket> => {
  if (attemptNumber > MAX_CONNECTION_ATTEMPTS) {
    throw new Error('Failed to connect to speech server after multiple attempts');
  }
  
  // Try each port in sequence
  for (const port of WEBSOCKET_PORTS) {
    const wsAddress = `ws://localhost:${port}`;
    console.log(`Attempting to connect to speech server at ${wsAddress}`);
    
    try {
      // Wait for connection to open or fail
      const ws = await new Promise<WebSocket>((resolve, reject) => {
        const socket = new WebSocket(wsAddress);
        const timeout = setTimeout(() => {
          socket.close();
          reject(new Error(`Connection to ${wsAddress} timed out`));
        }, 1000);
        
        socket.onopen = () => {
          clearTimeout(timeout);
          resolve(socket);
        };
        
        socket.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Connection to ${wsAddress} failed`));
        };
      });
      
      console.log(`Successfully connected to speech server on port ${port}`);
      return ws;
    } catch (error) {
      console.warn(`Could not connect to port ${port}: ${error}`);
      // Continue to next port
    }
  }
  
  // If we get here, we tried all ports and none worked
  // Try again with increased attempt count (after a delay)
  await new Promise(resolve => setTimeout(resolve, 500));
  return tryConnectToWebSocketServer(attemptNumber + 1);
};

// Function to speak on Raspberry Pi using WebSocket to communicate with speech-server.py
const speakViaRpiServer = async (text: string): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      console.log(`RPi speaking via Google Cloud TTS: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // Play silent audio to unlock audio context (helps with browser autoplay policies)
      await playSound();
      
      // Try to connect to speech server
      let ws: WebSocket;
      try {
        ws = await tryConnectToWebSocketServer();
      } catch (error) {
        console.error('WebSocket connection error:', error);
        reject(new Error('Could not connect to speech server. Please check if it is running.'));
        return;
      }
      
      // Set up a message event handler to detect speech completion or errors
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('Speech server response:', response);
          
          if (response.status === 'speech_completed') {
            resolve();
            setTimeout(() => ws.close(), 100);
          } else if (response.status === 'speech_failed' || response.error) {
            reject(new Error(response.error || 'Speech failed'));
            ws.close();
          }
        } catch (e) {
          console.warn('Error parsing WebSocket message:', e);
        }
      };
      
      // Set up error handler
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('WebSocket connection error'));
        try { ws.close(); } catch (e) { /* ignore */ }
      };
      
      // Set up close handler
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      // Send the speak command with Google Cloud TTS mode
      ws.send(JSON.stringify({
        action: 'speak',
        text: text,
        mode: 'google_cloud_tts'
      }));
      
      // Fallback: resolve after estimated duration if we don't get a completion message
      const estimatedDuration = Math.max(2000, text.length * 80);
      setTimeout(() => {
        console.log(`Resolving speech after estimated duration: ${estimatedDuration}ms`);
        resolve();
        try { ws.close(); } catch (e) { /* ignore */ }
      }, estimatedDuration);
      
    } catch (error) {
      console.error('RPi speech error:', error);
      reject(error);
    }
  });
};

// Function to speak using Google Cloud TTS directly from browser
const speakViaGoogleTTS = async (text: string): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      console.log(`Browser speaking via Google Cloud TTS: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // Play silent audio to unlock audio context (helps with browser autoplay policies)
      await playSound();
      
      // Call the TTS API (this would typically go through a proxy server to hide API keys)
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Cloud TTS API error: ${errorText}`);
      }
      
      // Get the audio data from the API response
      const audioData = await response.arrayBuffer();
      
      // Create an audio element to play the synthesized speech
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Add event listeners
      source.onended = () => {
        console.log('Google Cloud TTS speech completed');
        resolve();
      };
      
      // Start playing audio
      source.start();
      
      // Failsafe: resolve after audio buffer duration + small buffer
      const bufferDuration = audioBuffer.duration * 1000;
      setTimeout(() => {
        console.log(`Resolving Google Cloud TTS speech after buffer duration: ${bufferDuration}ms`);
        resolve();
      }, bufferDuration + 500);
      
    } catch (error) {
      console.error('Google Cloud TTS error:', error);
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

// Function to speak text using Web Speech API (fallback for browsers if Google Cloud TTS fails)
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
      
      console.log(`Speaking with Web Speech API: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
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
        console.log('Web Speech API completed');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Web Speech API error:', event);
        reject(new Error('Speech synthesis error'));
      };
      
      // Failsafe: If speech doesn't end naturally, resolve after timeout
      const timeout = Math.max(5000, text.length * 100);
      const timer = setTimeout(() => {
        console.warn(`Web Speech API timed out after ${timeout}ms`);
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
      // For Raspberry Pi, send a stop command to our WebSocket server
      // Try multiple ports in case the default one isn't being used
      (async () => {
        // Use a flag to track if we've successfully connected to any port
        let connected = false;
        
        // Try each port until we succeed
        for (const port of WEBSOCKET_PORTS) {
          // Skip if we've already connected successfully
          if (connected) continue;
          
          try {
            const ws = new WebSocket(`ws://localhost:${port}`);
            
            // Set up event handlers
            ws.onopen = () => {
              ws.send(JSON.stringify({
                action: 'stop'
              }));
              setTimeout(() => ws.close(), 100);
              connected = true; // Mark as connected
            };
            
            // Wait a bit to see if connection opens
            await new Promise(r => setTimeout(r, 200));
          } catch (e) {
            console.warn(`Could not send stop command to port ${port}:`, e);
          }
        }
      })();
    } else {
      // For Web Speech API (fallback)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // For Google Cloud TTS, we simply let the audio finish
      // Web Audio API doesn't have a direct "cancel" method for buffers that are playing
      console.log('Allowing any Google Cloud TTS audio to complete naturally');
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

// Function to check if speech capabilities are available
export const isSpeechAvailable = async (): Promise<boolean> => {
  if (runningOnRPi) {
    try {
      // Try to connect to the WebSocket server on any available port
      try {
        const ws = await tryConnectToWebSocketServer();
        console.log('Speech server is available');
        
        // Send a ping to verify the server is working
        ws.send(JSON.stringify({ action: 'ping' }));
        
        // Close the WebSocket after testing
        setTimeout(() => {
          try { ws.close(); } catch (e) { /* ignore */ }
        }, 300);
        
        return true;
      } catch (error) {
        console.error('Speech server is not available:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  } else {
    try {
      // Try to ping the Google Cloud TTS API endpoint
      const response = await fetch('/api/tts/status', { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('Google Cloud TTS API is available');
        return true;
      }
      
      // If Google Cloud TTS is not available, check for Web Speech API as fallback
      if ('speechSynthesis' in window) {
        console.log('Web Speech API is available as fallback');
        return true;
      }
      
      console.error('No speech synthesis methods available');
      return false;
    } catch (error) {
      console.warn('Error checking Google Cloud TTS availability:', error);
      
      // Check for Web Speech API as fallback
      if ('speechSynthesis' in window) {
        console.log('Web Speech API is available as fallback');
        return true;
      }
      
      console.error('No speech synthesis methods available');
      return false;
    }
  }
};
