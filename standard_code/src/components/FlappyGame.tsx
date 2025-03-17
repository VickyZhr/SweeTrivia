
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FlappyGame: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the Python game
    canvas.width = 1200;
    canvas.height = 620;
    
    // Game variables
    let bird = {
      x: 200,
      y: 200,
      radius: 10,
      velocity: 0,
      gravity: 0.5,
      jumpStrength: -10
    };
    
    let pipe = {
      x: canvas.width,
      width: 60,
      gap: 60
    };
    
    const gapPositions = [150, 250, 350, 450]; // Fixed gap positions
    const gapSize = 5 * bird.radius;
    
    let currentScore = 0;
    let currentLives = 3;
    let gameRunning = false;
    let passedPipe = false;
    let missedPipe = false;
    let movingRate = 10;
    
    // Flash effect variables
    let flashTimer = 0;
    let flashDuration = 20;
    let flashActive = false;
    
    // Questions and Answers (matches Python code)
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
    
    // Load the bird image
    const birdImg = new Image();
    birdImg.src = '/lovable-uploads/c90aa45a-dfa1-45b4-8eed-aca82b10cae1.png';
    
    // Function to show start screen
    const showStartScreen = () => {
      ctx.fillStyle = '#72c6ce'; // SKY color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.fillText("TAP TO START", canvas.width / 2 - 50, canvas.height / 2);
    };
    
    // Function to show game over screen
    const showGameOverScreen = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText("GAME OVER", canvas.width / 2 - 40, canvas.height / 2 - 40);
      ctx.fillText(`Score: ${currentScore}`, canvas.width / 2 - 40, canvas.height / 2);
      ctx.fillText("Press SPACE to Restart", canvas.width / 2 - 80, canvas.height / 2 + 40);
      
      setGameOver(true);
    };
    
    // Function to reset game
    const resetGame = () => {
      bird.y = 200;
      bird.velocity = 0;
      pipe.x = canvas.width;
      currentScore = 0;
      currentLives = 3;
      setScore(0);
      setLives(3);
      passedPipe = false;
      missedPipe = false;
      gameRunning = false;
      setGameStarted(false);
      setGameOver(false);
      currentQuestion = questions[Math.floor(Math.random() * questions.length)];
      showStartScreen();
    };
    
    // Function to draw pipes
    const drawPipes = () => {
      const labels = ["A", "B", "C", "D"];
      const options = currentQuestion.options; // Assuming this holds the answer choices
    
      // Set pipe colors
      ctx.fillStyle = '#00c800'; // GREEN color
    
      // Draw pipes above and below the gaps with black borders
      const drawPipeSection = (x, y, width, height) => {
        ctx.fillRect(x, y, width, height); // Draw pipe
        ctx.strokeStyle = '#000000'; // BLACK border
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height); // Draw border
      };
    
      drawPipeSection(pipe.x, 0, pipe.width, gapPositions[0]);
      drawPipeSection(pipe.x, gapPositions[0] + gapSize, pipe.width, gapPositions[1] - (gapPositions[0] + gapSize));
      drawPipeSection(pipe.x, gapPositions[1] + gapSize, pipe.width, gapPositions[2] - (gapPositions[1] + gapSize));
      drawPipeSection(pipe.x, gapPositions[2] + gapSize, pipe.width, gapPositions[3] - (gapPositions[2] + gapSize));
      drawPipeSection(pipe.x, gapPositions[3] + gapSize, pipe.width, canvas.height - (gapPositions[3] + gapSize));
    
      // Draw answer labels and options inside the gaps
      ctx.fillStyle = '#000000'; // BLACK color
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
    
      for (let i = 0; i < 4; i++) {
        let textX = pipe.x + pipe.width / 2;
        let textY = gapPositions[i] + gapSize / 2;
    
        ctx.fillText(labels[i], textX, textY - 10); // Draw label (A, B, C, D)
        ctx.fillText(options[i], textX, textY + 15); // Draw corresponding answer option
      }
    
      // Check if the bird passes through the correct answer's gap
      const correctLabel = currentQuestion.correct;
      const correctIndex = labels.indexOf(correctLabel);
    
      if (pipe.x < bird.x && pipe.x + pipe.width > bird.x) {
        if (!(bird.y >= gapPositions[correctIndex] && bird.y <= gapPositions[correctIndex] + gapSize)) {
          if (!missedPipe) {
            currentLives--;
            setLives(currentLives);
            flashActive = true;
            flashTimer = flashDuration;
            missedPipe = true;
            toast.error("Wrong answer!");
          }
        } else if (!passedPipe) {
          currentScore += 10;
          setScore(currentScore);
          passedPipe = true;
          toast.success("Correct answer! +10 points");
        }
      }
    
      // Flashing effect for score/lives display
      let textColor = '#FFFFFF'; // WHITE color
      let fontSize = '30px';
    
      if (flashActive && flashTimer > 0) {
        textColor = flashTimer % 10 < 5 ? '#FF0000' : '#FFFFFF'; // Toggle RED and WHITE
        fontSize = '50px';
      }
    
      // Display score and lives
      ctx.fillStyle = textColor;
      ctx.font = fontSize + ' Arial';
      ctx.fillText(`Score: ${currentScore}`, canvas.width - 200, 30);
      ctx.fillText(`Lives: ${currentLives}`, canvas.width - 200, 70);
    };
    
    // Function to draw bird
    const drawBird = () => {
      if (birdImg.complete) {
        ctx.drawImage(birdImg, bird.x - 25, bird.y - 20, 50, 40);
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#FFFF00'; // YELLOW color
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    };
    
    // Function to draw question
    const drawQuestion = () => {
      const padding = 15;
      const lineHeight = 25;
      
      // Calculate box dimensions
      ctx.font = '20px Arial';
      const textWidths = [ctx.measureText(currentQuestion.question).width];
      
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const option = currentQuestion.options[i];
        textWidths.push(ctx.measureText(`${String.fromCharCode(65 + i)}. ${option}`).width);
      }
      
      const boxWidth = Math.max(...textWidths) + 2 * padding;
      const boxX = 10;
      const boxY = 50;
      const numLines = 1 + currentQuestion.options.length;
      const boxHeight = padding * 2 + numLines * lineHeight;
      
      // Draw transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw question text
      ctx.fillStyle = '#FFFFFF'; // WHITE color
      ctx.font = '20px Arial';
      ctx.fillText(currentQuestion.question, boxX + padding, boxY + padding + lineHeight);
      
      // Draw answer options
      for (let i = 0; i < currentQuestion.options.length; i++) {
        const option = currentQuestion.options[i];
        ctx.fillText(
          `${String.fromCharCode(65 + i)}. ${option}`,
          boxX + padding,
          boxY + padding + (i + 2) * lineHeight
        );
      }
    };
    
    // Game loop
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#72c6ce'; // SKY color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (gameRunning) {
        // Update bird position
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Move pipes
        pipe.x -= movingRate;
        if (pipe.x < -pipe.width) {
          pipe.x = canvas.width;
          currentQuestion = questions[Math.floor(Math.random() * questions.length)];
          passedPipe = false;
          missedPipe = false;
        }
        
        // Collision detection (hitting top/bottom)
        if (bird.y <= 0 || bird.y >= canvas.height - bird.radius) {
          if (currentLives > 0) {
            currentLives--;
            setLives(currentLives);
            flashActive = true;
            flashTimer = flashDuration;
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            toast.warning("Hit the boundary! Lost a life.");
          }
        }
        
        // Flash timer countdown
        if (flashTimer > 0) {
          flashTimer--;
        } else {
          flashActive = false;
        }
        
        // Check if game over
        if (currentLives <= 0) {
          showGameOverScreen();
          gameRunning = false;
        }
        
        // Draw game elements
        drawPipes();
        drawBird();
        drawQuestion();
      } else if (gameOver) {
        showGameOverScreen();
      } else {
        showStartScreen();
      }
      
      // Continue game loop
      requestAnimationFrame(gameLoop);
    };
    
    // Handle key/mouse press for jump and game control
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (!gameRunning && !gameOver) {
          gameRunning = true;
          setGameStarted(true);
        } else if (gameOver) {
          resetGame();
        } else if (gameRunning) {
          bird.velocity = bird.jumpStrength;
        }
      }
    };
    
    const handleClick = () => {
      if (!gameRunning && !gameOver) {
        gameRunning = true;
        setGameStarted(true);
      } else if (gameOver) {
        resetGame();
      } else if (gameRunning) {
        bird.velocity = bird.jumpStrength;
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);
    
    // Start the game
    showStartScreen();
    gameLoop();
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);
  
  const handleExit = () => {
    navigate('/exit');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pink-500 relative overflow-hidden">
      <div className="w-full max-w-5xl mx-auto z-10">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800 font-mono">Flappy Bird - Challenge Mode</h1>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-300 px-3 py-1 rounded-full text-green-800 font-bold">
              Score: {score}
            </div>
            <div className="bg-red-400 px-3 py-1 rounded-full text-white font-bold">
              Lives: {lives}
            </div>
          </div>
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
            <ul className="list-disc pl-5 text-sm">
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
