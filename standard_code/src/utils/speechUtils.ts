// src/utils/speechUtils.ts

export const speakWithEspeakNg = async (text: string): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3001/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger narration');
    }

    await response.json(); // Wait for narration to complete
  } catch (error) {
    console.error('Narration error:', error);
  }
};



// // A simplified utility for text-to-speech using either Web Speech API or espeak-ng

// // Check if we're on Raspberry Pi (simplified detection)
// const isRaspberryPi = (): boolean => {
//   try {
//     const userAgent = navigator.userAgent.toLowerCase();
//     return userAgent.includes('linux arm') || 
//            userAgent.includes('raspberry') ||
//            localStorage.getItem('rpi_mode') === 'true';
//   } catch (error) {
//     console.error('Error detecting device type:', error);
//     return false;
//   }
// };

// // Global variable to track if we're on Raspberry Pi
// const runningOnRPi = isRaspberryPi();
// console.log(`Running on Raspberry Pi: ${runningOnRPi}`);

// // WebSocket server details for Raspberry Pi
// const WS_SERVER_PORT = 8765;

// // Function to speak text
// export const speak = (text: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     if (runningOnRPi) {
//       // Use WebSocket to communicate with speech server on Raspberry Pi
//       speakWithEspeakNg(text)
//         .then(resolve)
//         .catch(reject);
//     } else {
//       // Use Web Speech API for browsers
//       speakWithWebSpeechAPI(text)
//         .then(resolve)
//         .catch(reject);
//     }
//   });
// };

// // Function to speak using espeak-ng via WebSocket
// const speakWithEspeakNg = async (text: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log(`Speaking with espeak-ng: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
//       // Connect to WebSocket server
//       const ws = new WebSocket(`ws://localhost:${WS_SERVER_PORT}`);
      
//       // Handle WebSocket events
//       ws.onopen = () => {
//         // Send speak command
//         ws.send(JSON.stringify({
//           action: 'speak',
//           text: text
//         }));
//       };
      
//       ws.onmessage = (event) => {
//         try {
//           const response = JSON.parse(event.data);
//           if (response.status === 'speech_completed') {
//             resolve();
//             ws.close();
//           } else if (response.status === 'speech_failed') {
//             reject(new Error('Speech failed'));
//             ws.close();
//           }
//         } catch (e) {
//           console.warn('Error parsing WebSocket message:', e);
//         }
//       };
      
//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         reject(new Error('WebSocket connection error'));
//         ws.close();
//       };
      
//       // Fallback: resolve after estimated duration if no completion message
//       const estimatedDuration = Math.max(2000, text.length * 80);
//       setTimeout(() => {
//         resolve();
//         try { ws.close(); } catch (e) { /* ignore */ }
//       }, estimatedDuration);
      
//     } catch (error) {
//       console.error('espeak-ng speech error:', error);
//       reject(error);
//     }
//   });
// };

// // Function to speak using Web Speech API
// const speakWithWebSpeechAPI = (text: string): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     try {
//       if (!('speechSynthesis' in window)) {
//         reject(new Error('Speech synthesis not supported'));
//         return;
//       }
      
//       const synth = window.speechSynthesis;
      
//       // Cancel any ongoing speech
//       if (synth.speaking) {
//         synth.cancel();
//       }
      
//       console.log(`Speaking with Web Speech API: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
//       // Create a new utterance
//       const utterance = new SpeechSynthesisUtterance(text);
      
//       // Configure speech settings - use a female voice
//       utterance.rate = 0.9;
//       utterance.pitch = 1;
//       utterance.volume = 1;
      
//       // Try to find a good female voice
//       const voices = synth.getVoices();
//       if (voices.length > 0) {
//         const femaleVoice = voices.find(voice => 
//           voice.name.toLowerCase().includes('female') || 
//           voice.name.toLowerCase().includes('woman') ||
//           voice.name.toLowerCase().includes('girl') ||
//           voice.name.includes('Google UK English Female') ||
//           voice.name.includes('Microsoft Zira')
//         );
        
//         // If no explicitly female voice, try to find any English voice
//         const englishVoice = voices.find(voice => 
//           voice.lang.includes('en-US') || 
//           voice.lang.includes('en-GB')
//         );
        
//         // Use the best available voice
//         utterance.voice = femaleVoice || englishVoice || voices[0];
//         console.log(`Using voice: ${utterance.voice.name}`);
//       }
      
//       // Add event listeners
//       utterance.onend = () => {
//         console.log('Speech completed');
//         resolve();
//       };
      
//       utterance.onerror = (event) => {
//         console.error('Speech error:', event);
//         reject(new Error('Speech synthesis error'));
//       };
      
//       // Failsafe: resolve after timeout
//       const timeout = Math.max(5000, text.length * 80);
//       const timer = setTimeout(() => {
//         console.log(`Speech timed out after ${timeout}ms`);
//         resolve();
//       }, timeout);
      
//       // Start speaking
//       synth.speak(utterance);
//     } catch (error) {
//       console.error('Web Speech API error:', error);
//       reject(error);
//     }
//   });
// };

// // Function to stop any ongoing speech
// export const stopSpeech = (): void => {
//   try {
//     if (runningOnRPi) {
//       // For Raspberry Pi, send a stop command to WebSocket server
//       try {
//         const ws = new WebSocket(`ws://localhost:${WS_SERVER_PORT}`);
//         ws.onopen = () => {
//           ws.send(JSON.stringify({ action: 'stop' }));
//           setTimeout(() => ws.close(), 100);
//         };
//       } catch (e) {
//         console.warn('Could not send stop command:', e);
//       }
//     } else {
//       // For Web Speech API
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel();
//       }
//     }
//   } catch (error) {
//     console.error('Error stopping speech:', error);
//   }
// };

// // Function to check if speech capabilities are available
// export const isSpeechAvailable = async (): Promise<boolean> => {
//   if (runningOnRPi) {
//     try {
//       // Try to connect to the WebSocket server
//       const ws = new WebSocket(`ws://localhost:${WS_SERVER_PORT}`);
      
//       return new Promise((resolve) => {
//         ws.onopen = () => {
//           console.log('Speech server is available');
//           ws.send(JSON.stringify({ action: 'ping' }));
          
//           // Close the WebSocket after testing
//           setTimeout(() => {
//             try { ws.close(); } catch (e) { /* ignore */ }
//             resolve(true);
//           }, 300);
//         };
        
//         ws.onerror = () => {
//           console.error('Speech server is not available');
//           resolve(false);
//         };
        
//         // Timeout in case the connection hangs
//         setTimeout(() => {
//           resolve(false);
//         }, 1000);
//       });
//     } catch (error) {
//       console.error('Error checking speech availability:', error);
//       return false;
//     }
//   } else {
//     // Check if Web Speech API is available
//     return Promise.resolve('speechSynthesis' in window);
//   }
// };
