
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTrivia } from '@/context/TriviaContext';

const FlappyGame: React.FC = () => {
  const navigate = useNavigate();
  const { updateScore } = useTrivia();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);

  const gameRunningRef = useRef(false);
  const currentScoreRef = useRef(0);
  const currentLivesRef = useRef(3);
  const passedPipeRef = useRef(false);
  const missedPipeRef = useRef(false);
  const flashTimerRef = useRef(0);
  const flashActiveRef = useRef(false);

  // Get initial score from location state if available
  useEffect(() => {
    // Check for saved score in sessionStorage
    const savedScore = sessionStorage.getItem('flappyScore');
    if (savedScore) {
      const parsedScore = parseInt(savedScore, 10);
      setScore(parsedScore);
      currentScoreRef.current = parsedScore;
      
      // Clear storage after retrieving
      sessionStorage.removeItem('flappyScore');
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 620;

    const bird = {
      x: 200,
      y: 200,
      radius: 10,
      velocity: 0,
      gravity: 0.5,
      jumpStrength: -10
    };

    const pipe = {
      x: canvas.width,
      width: 60,
      gap: 60
    };

    const gapPositions = [150, 250, 350, 450];
    const gapSize = 6 * bird.radius;
    const movingRate = 10;

    const questions = [
      {
        question: "How many legs does a spider have?",
        options: ["2", "4", "6", "8"],
        correct: "A"
      },
      {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correct: "A"
      },
      {
        question: "What is 5 + 5?",
        options: ["8", "9", "10", "11"],
        correct: "A"
      }
    ];

    let currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    const birdImg = new Image();
    birdImg.src = '/lovable-uploads/c90aa45a-dfa1-45b4-8eed-aca82b10cae1.png';

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
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 40);
    };

    const resetGame = () => {
      bird.y = 200;
      bird.velocity = 0;
      pipe.x = canvas.width;
      currentScoreRef.current = 0;
      currentLivesRef.current = 3;
      passedPipeRef.current = false;
      missedPipeRef.current = false;
      gameRunningRef.current = false;
      flashActiveRef.current = false;
      flashTimerRef.current = 0;
      setScore(0);
      setLives(3);
      setGameStarted(false);
      setGameOver(false);
      currentQuestion = questions[Math.floor(Math.random() * questions.length)];
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
            flashTimerRef.current = 20;
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

      if (gameOver) {
        // Instead of showing game over screen, navigate to RoundUp
        // Save the current score first
        updateScore(currentScoreRef.current);
        // Save score to sessionStorage for retrieval on continue
        sessionStorage.setItem('flappyScore', currentScoreRef.current.toString());
        // Navigate to RoundUp with fromChallenge flag
        navigate('/exit', { state: { fromChallenge: true } });
        return;
      }

      if (gameRunningRef.current) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        pipe.x -= movingRate;

        if (pipe.x < -pipe.width) {
          pipe.x = canvas.width;
          currentQuestion = questions[Math.floor(Math.random() * questions.length)];
          passedPipeRef.current = false;
          missedPipeRef.current = false;
        }

        if (bird.y <= 0 || bird.y >= canvas.height - bird.radius) {
          if (currentLivesRef.current > 0) {
            currentLivesRef.current--;
            setLives(currentLivesRef.current);
            flashActiveRef.current = true;
            flashTimerRef.current = 20;
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            toast.warning("Hit the boundary! Lost a life.");
          }
        }

        if (currentLivesRef.current <= 0) {
          gameRunningRef.current = false;
          if (!gameOver) {
            setGameOver(true);
            // We'll handle the game over navigation in the useEffect below
          }
          return;
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
  }, [navigate, updateScore]);

  // Watch for game over state and navigate to RoundUp
  useEffect(() => {
    if (gameOver) {
      // Small delay to ensure score is updated before navigation
      const timer = setTimeout(() => {
        updateScore(currentScoreRef.current);
        // Save score to sessionStorage for retrieval on continue
        sessionStorage.setItem('flappyScore', currentScoreRef.current.toString());
        // Navigate to RoundUp with fromChallenge flag
        navigate('/roundup', { state: { fromChallenge: true } });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameOver, navigate, updateScore]);

  const handleExit = () => {
    // Save score before navigating
    updateScore(currentScoreRef.current);
    sessionStorage.setItem('flappyScore', currentScoreRef.current.toString());
    navigate('/roundup', { state: { fromChallenge: true } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pink-500 relative overflow-hidden">
      <div className="w-full max-w-5xl mx-auto z-10">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800 font-mono">Flappy Bird - Challenge Mode</h1>
        </header>

        <div className="relative mb-8 p-4 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30 flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-lg cursor-pointer"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            Your browser does not support canvas.
          </canvas>
        </div>

        <div className="flex justify-between">
          <div className="text-white bg-black/50 backdrop-blur-sm p-4 rounded-lg max-w-xs">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 text-xs">
              <li>Press SPACE or click to make the bird jump</li>
              <li>Fly through the gap with the correct answer</li>
              <li>Get 10 points for each correct answer</li>
              <li>You have 3 lives - don't hit the pipes or boundaries!</li>
            </ul>
          </div>

          <Button
            onClick={handleExit}
            variant="yellow"
            size="lg"
            className="mt-4"
          >
            Exit Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlappyGame;
