export function playSound(filename: string) {
    const audio = new Audio(`/sounds/${filename}`);
    audio.play();
  }