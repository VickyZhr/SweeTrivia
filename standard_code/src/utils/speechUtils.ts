// A utility for handling text-to-speech functionality optimized for Raspberry Pi

const isRaspberryPi = (): boolean => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const raspberryPiIndicators = ['linux armv', 'raspberry', 'rpi', 'linux arm'];
    return raspberryPiIndicators.some(indicator => userAgent.includes(indicator));
  } catch (error) {
    console.error('Error detecting device type:', error);
    return false;
  }
};

const runningOnRPi = isRaspberryPi();

// Speak using espeak-ng on Raspberry Pi, or Web Speech API on other devices
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (runningOnRPi) {
      console.log('Using Raspberry Pi speech method');
      speakOnRaspberryPi(text).then(resolve).catch(reject);
    } else {
      console.log('Using standard Web Speech API');
      speakWithWebSpeechAPI(text).then(resolve).catch(reject);
    }
  });
};

// Replaced WebSocket/iframe logic with backend POST call
const speakOnRaspberryPi = async (text: string): Promise<void> => {
  try {
    await fetch('http://localhost:3001/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error('Failed to speak via backend:', error);
  }
};

// Web Speech API fallback (for dev/test on laptops/desktops)
const speakWithWebSpeechAPI = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        return reject(new Error('Speech synthesis not supported'));
      }

      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = synth.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices.find(v => v.lang.includes('en-US')) || voices[0];
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error('Speech synthesis error'));

      synth.speak(utterance);
    } catch (error) {
      console.error('Web Speech API error:', error);
      reject(error);
    }
  });
};

// Stop current speech
export const stopSpeech = (): void => {
  try {
    if (runningOnRPi) {
      // Nothing to stop directly from frontend if using backend
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};
