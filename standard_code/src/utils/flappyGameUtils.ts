// Utility functions and constants for the Flappy Challenge game

export interface Bird {
  x: number;
  y: number;
  radius: number;
  velocity: number;
  gravity: number;
  jumpStrength: number;
}

export interface Pipe {
  x: number;
  width: number;
  gap: number;
}

// Fixed positions for the gap in pipes
export const gapPositions = [150, 250, 350, 450];

// Size of the gap between pipes (multiplier of bird radius)
export const gapSizeMultiplier = 6;

// Rate at which pipes move across the screen
export const movingRate = 10;

// Flash effect duration
export const flashDuration = 20;

// Initialize bird object with default values
export const initializeBird = (): Bird => ({
  x: 200,
  y: 200,
  radius: 10,
  velocity: 0,
  gravity: 0.5,
  jumpStrength: -10
});

// Initialize pipe object with default values
export const initializePipe = (canvasWidth: number): Pipe => ({
  x: canvasWidth,
  width: 60,
  gap: 60
});
