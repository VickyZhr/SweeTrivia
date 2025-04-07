
export type TriviaQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
};

// Parse CSV data into TriviaQuestion objects with improved format handling
export const parseCSV = (csvData: string): TriviaQuestion[] => {
  try {
    const lines = csvData.trim().split('\n');
    
    // Handle empty file
    if (lines.length === 0) {
      console.error("CSV file is empty");
      return [];
    }
    
    // Try to determine the delimiter by checking the first line
    const firstLine = lines[0];
    let delimiter = '\t'; // Default to tab
    
    // Check for common delimiters
    if (firstLine.includes(',') && !firstLine.includes('\t')) {
      delimiter = ',';
    } else if (firstLine.includes(';')) {
      delimiter = ';';
    }
    
    console.log(`Detected delimiter: ${delimiter === '\t' ? 'tab' : delimiter}`);
    
    const questions = lines.map((line, index) => {
      // Skip empty lines
      if (line.trim() === '') {
        return null;
      }
      
      const parts = line.split(delimiter);
      
      // Check if we have at least a question and some options
      if (parts.length < 2) {
        console.warn(`Line ${index + 1}: Not enough fields (${parts.length}). Expected at least 2.`);
        return null;
      }
      
      const question = parts[0].trim();
      
      // Determine how many options we have (expecting at least 1)
      const optionsCount = Math.min(4, parts.length - 2);
      if (optionsCount < 1) {
        console.warn(`Line ${index + 1}: Not enough options.`);
        return null;
      }
      
      // Extract options
      const options = parts.slice(1, 1 + optionsCount).map(opt => opt.trim());
      
      // Extract answer key (A, B, C, D or 0, 1, 2, 3 or the actual answer text)
      const answerKey = parts[1 + optionsCount]?.trim() || '';
      
      // Try to determine what kind of answer key we have
      let correctAnswerIndex = -1;
      
      // Case 1: Letter answer (A, B, C, D)
      if (/^[A-D]$/i.test(answerKey)) {
        correctAnswerIndex = answerKey.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
      } 
      // Case 2: Numeric answer (0, 1, 2, 3)
      else if (/^[0-3]$/.test(answerKey)) {
        correctAnswerIndex = parseInt(answerKey, 10);
      } 
      // Case 3: Answer text matching one of the options
      else {
        correctAnswerIndex = options.findIndex(opt => 
          opt.toLowerCase() === answerKey.toLowerCase()
        );
      }
      
      // Check if we found a valid answer
      if (correctAnswerIndex === -1 || correctAnswerIndex >= options.length) {
        console.warn(`Line ${index + 1}: Could not determine correct answer from "${answerKey}"`);
        return null;
      }
      
      const correctAnswer = options[correctAnswerIndex];
      
      // Category is optional, use the next field or default to "General"
      const category = parts[2 + optionsCount]?.trim() || 'General';
      
      return {
        id: index,
        question,
        options,
        correctAnswer,
        category
      };
    }).filter(Boolean) as TriviaQuestion[];
    
    // If we couldn't parse any questions, throw an error
    if (questions.length === 0) {
      throw new Error("Could not parse any valid questions from the file. Please check the format.");
    }
    
    console.log(`Successfully parsed ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Shuffle an array using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get letter corresponding to option index
export const getOptionLetter = (index: number): string => {
  return String.fromCharCode(65 + index); // 65 = ASCII for 'A'
};

// Calculate percentage
export const calculatePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Sample trivia data with tab separation for clarity, including categories
export const sampleTriviaData = `What animal has the highest blood pressure?\tGiraffe\tDog\tElephant\tCheetah\tA\tScience
What is the building block of matter?\tMolecule\tAtom\tCell\tProton\tB\tScience
C is an abbreviation of which chemical component?\tCarbon\tCalcium\tCopper\tCobalt\tA\tScience
Which of these is a theory about the creation of the universe?\tEvolution\tPlate Tectonics\tBig Bang\tString Theory\tC\tScience
Who painted the Mona Lisa?\tMichelangelo\tLeonardo da Vinci\tPablo Picasso\tVincent van Gogh\tB\tEntertainment
Which sport uses a shuttlecock?\tBadminton\tTennis\tBasketball\tGolf\tA\tSports
Which planet is closest to the sun?\tVenus\tMercury\tEarth\tMars\tB\tScience
What was the first feature-length animated movie ever released?\tSnow White and the Seven Dwarfs\tPinocchio\tBambi\tCinderella\tA\tEntertainment
Who wrote "To Kill a Mockingbird"?\tJ.K. Rowling\tHarper Lee\tStephen King\tErnest Hemingway\tB\tEntertainment
Which of these sports does NOT use a ball?\tHockey\tPolo\tSwimming\tGolf\tC\tSports`;
