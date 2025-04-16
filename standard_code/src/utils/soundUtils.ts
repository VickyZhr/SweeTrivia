const audioCache: { [key: string]: HTMLAudioElement } = {};

export function playSound(filename: string) {
  const path = `/sounds/${filename}`;

  if (!audioCache[path]) {
    const audio = new Audio(path);
    audio.load(); // preload
    audioCache[path] = audio;
  }

  const sound = audioCache[path];
  sound.currentTime = 0; // restart sound if already playing
  sound.play().catch((err) => {
    console.warn("Audio playback failed:", err);
  });
}
