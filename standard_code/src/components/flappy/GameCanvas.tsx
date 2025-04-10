import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Bird, 
  Pipe, 
  Question, 
  gapPositions, 
  gapSizeMultiplier, 
  movingRate, 
  flashDuration,
  getRandomQuestion
} from '@/utils/flappyGameUtils';

interface GameCanvasProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  gameStarted: boolean;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  onGameOver: () => void;
  initialScore: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  score,
  setScore,
  lives,
  setLives,
  gameOver,
  setGameOver,
  gameStarted,
  setGameStarted,
  onGameOver,
  initialScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state refs to access in event handlers
  const gameRunningRef = useRef(false);
  const currentScoreRef = useRef(initialScore);
  const currentLivesRef = useRef(3);
  const passedPipeRef = useRef(false);
  const missedPipeRef = useRef(false);
  const flashTimerRef = useRef(0);
  const flashActiveRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 620;
    
    // Game objects
    let bird: Bird = {
      x: 200,
      y: 200,
      radius: 10,
      velocity: 0,
      gravity: 0.5,
      jumpStrength: -10
    };
    
    let pipe: Pipe = {
      x: canvas.width,
      width: 60,
      gap: 60
    };
    
    const gapSize = gapSizeMultiplier * bird.radius;
    let currentQuestion = getRandomQuestion();

    // Load bird image
    const birdImg = new Image();
    birdImg.src = '/lovable-uploads/c90aa45a-dfa1-45b4-8eed-aca82b10cae1.png';

    // Drawing functions
    const showStartScreen = () => {
      ctx.fillStyle = '#72c6ce';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TAP TO START", canvas.width / 2, canvas.height / 2);
    };

    const showGameOverScreen = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '30px Arial';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillText(`Score: ${currentScoreRef.current}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 40);
      
      // Trigger game over callback after a short delay
      setTimeout(() => {
        onGameOver();
      }, 2000);
    };

    const resetGame = () => {
      bird.y = 200;
      bird.velocity = 0;
      pipe.x = canvas.width;
      // Keep the existing score when continuing
      currentScoreRef.current = initialScore;
      currentLivesRef.current = 3;
      passedPipeRef.current = false;
      missedPipeRef.current = false;
      gameRunningRef.current = false;
      flashActiveRef.current = false;
      flashTimerRef.current = 0;
      setScore(initialScore);
      setLives(3);
      setGameStarted(false);
      setGameOver(false);
      currentQuestion = getRandomQuestion();
      showStartScreen();
    };

    const drawPipes = () => {
      const labels = ["A", "B", "C", "D"];
      const options = currentQuestion.options;
      ctx.fillStyle = '#00c800';

      const drawPipeSection = (x: number, y: number, width: number, height: number) => {
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
      };

      drawPipeSection(pipe.x, 0, pipe.width, gapPositions[0]);
      drawPipeSection(pipe.x, gapPositions[0] + gapSize, pipe.width, gapPositions[1] - (gapPositions[0] + gapSize));
      drawPipeSection(pipe.x, gapPositions[1] + gapSize, pipe.width, gapPositions[2] - (gapPositions[1] + gapSize));
      drawPipeSection(pipe.x, gapPositions[2] + gapSize, pipe.width, gapPositions[3] - (gapPositions[2] + gapSize));
      drawPipeSection(pipe.x, gapPositions[3] + gapSize, pipe.width, canvas.height - (gapPositions[3] + gapSize));

      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';

      for (let i = 0; i < 4; i++) {
        let textX = pipe.x + pipe.width / 2;
        let textY = gapPositions[i] + gapSize / 2;
        ctx.fillText(labels[i], textX, textY - 10);
        ctx.fillText(options[i], textX, textY + 15);
      }

      const correctIndex = labels.indexOf(currentQuestion.correct);

      if (pipe.x < bird.x && pipe.x + pipe.width > bird.x) {
        if (!(bird.y >= gapPositions[correctIndex] && bird.y <= gapPositions[correctIndex] + gapSize)) {
          if (!missedPipeRef.current) {
            currentLivesRef.current--;
            setLives(currentLivesRef.current);
            flashActiveRef.current = true;
            flashTimerRef.current = flashDuration;
            missedPipeRef.current = true;
            toast.error("Wrong answer!");
          }
        } else if (!passedPipeRef.current) {
          currentScoreRef.current += 10;
          setScore(currentScoreRef.current);
          passedPipeRef.current = true;
          toast.success("Correct answer! +10 points");
        }
      }

      let textColor = '#FFFFFF';
      let fontSize = '30px';

      if (flashActiveRef.current && flashTimerRef.current > 0) {
        textColor = flashTimerRef.current % 10 < 5 ? '#FF0000' : '#FFFFFF';
        fontSize = '50px';
      }

      ctx.fillStyle = textColor;
      ctx.font = fontSize + ' Arial';
      ctx.fillText(`Score: ${currentScoreRef.current}`, canvas.width - 200, 30);
      ctx.fillText(`Lives: ${currentLivesRef.current}`, canvas.width - 200, 70);
    };

    const drawBird = () => {
      if (birdImg.complete) {
        ctx.drawImage(birdImg, bird.x - 25, bird.y - 20, 50, 40);
      } else {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    };
    
    const drawQuestion = () => {
      const padding = 15;
      const lineHeight = 30;
    
      // Match the pixel font and size
      ctx.font = '30px monospace'; // Simulates pixel-text look
      const textWidths = [ctx.measureText(currentQuestion.question).width];
    
      for (let i = 0; i < currentQuestion.options.length; i++) {
        textWidths.push(ctx.measureText(`${String.fromCharCode(65 + i)}. ${currentQuestion.options[i]}`).width);
      }
    
      const boxWidth = Math.max(...textWidths) + 2 * padding;
      const boxX = 10;
      const boxY = 50;
      const numLines = 1 + currentQuestion.options.length;
      const boxHeight = padding * 2 + numLines * lineHeight;
    
      // Semi-transparent background box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
      // Set text styles
      ctx.font = '30px monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
    
      // Set shadow to simulate white outline
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 4;
    
      // Draw outline stroke first
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#006400'; // Deep green to match text-green-800
    
      // Draw question with outline
      ctx.strokeText(currentQuestion.question, boxX + padding, boxY + padding + lineHeight);
      ctx.fillText(currentQuestion.question, boxX + padding, boxY + padding + lineHeight);
    
      // Draw options with outline
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const text = `${String.fromCharCode(65 + i)}. ${currentQuestion.options[i]}`;
        const y = boxY + padding + (i + 2) * lineHeight;
        ctx.strokeText(text, boxX + padding, y);
        ctx.fillText(text, boxX + padding, y);
      }
    
      // Reset shadow
      ctx.shadowColor = 'transparent';
    };
    
    const gameLoop = () => {
      ctx.fillStyle = '#72c6ce';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameRunningRef.current) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        pipe.x -= movingRate;

        if (pipe.x < -pipe.width) {
          pipe.x = canvas.width;
          currentQuestion = getRandomQuestion();
          passedPipeRef.current = false;
          missedPipeRef.current = false;
        }

        if (bird.y <= 0 || bird.y >= canvas.height - bird.radius) {
          if (currentLivesRef.current > 0) {
            currentLivesRef.current--;
            setLives(currentLivesRef.current);
            flashActiveRef.current = true;
            flashTimerRef.current = flashDuration;
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            toast.warning("Hit the boundary! Lost a life.");
          }
        }

        if (currentLivesRef.current <= 0) {
          gameRunningRef.current = false;
          if (!gameOver) {
            setGameOver(true);
            setTimeout(() => showGameOverScreen(), 100);
          }
          return;
        }

        if (flashTimerRef.current > 0) {
          flashTimerRef.current--;
        } else {
          flashActiveRef.current = false;
        }

        drawPipes();
        drawBird();
        drawQuestion();
      } else {
        showStartScreen();
      }

      requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunningRef.current && !gameOver) {
          gameRunningRef.current = true;
          setGameStarted(true);
        } else if (gameOver) {
          resetGame();
        } else if (gameRunningRef.current) {
          bird.velocity = bird.jumpStrength;
        }
      }
    };

    const handleClick = () => {
      if (!gameRunningRef.current && !gameOver) {
        gameRunningRef.current = true;
        setGameStarted(true);
      } else if (gameOver) {
        resetGame();
      } else if (gameRunningRef.current) {
        bird.velocity = bird.jumpStrength;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);

    showStartScreen();
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
    };
  }, [initialScore, onGameOver, setGameOver, setGameStarted, setLives, setScore, gameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg shadow-lg cursor-pointer"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      Your browser does not support canvas.
    </canvas>
  );
};

export default GameCanvas;
