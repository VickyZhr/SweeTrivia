export interface TriviaQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

/**
 * Converts an array of trivia questions to CSV format
 */
export const convertToCSV = (questions: TriviaQuestion[]): string => {
  const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
  const csvRows = [];

  // Add the header row
  csvRows.push(headers.join(','));

  // Add the data rows
  for (const question of questions) {
    const values = [
      `"${question.question.replace(/"/g, '""')}"`,
      `"${question.optionA.replace(/"/g, '""')}"`,
      `"${question.optionB.replace(/"/g, '""')}"`,
      `"${question.optionC.replace(/"/g, '""')}"`,
      `"${question.optionD.replace(/"/g, '""')}"`,
      `"${question.correctAnswer}"`
    ];
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Downloads a CSV file with the given data
 */
export const downloadCSV = (csvData: string, filename = 'trivia_questions.csv'): void => {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Uploads the CSV to your backend (which sends it to Google Drive)
 */
export const uploadToCloud = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8080/upload', {
      method: 'POST',
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ File uploaded to Google Drive!');
      console.log('📎 Download link:', result.downloadLink);
      return true;
    } else {
      console.error('❌ Upload failed:', result);
      return false;
    }
  } catch (err) {
    console.error('🔥 Upload error:', err);
    return false;
  }
};