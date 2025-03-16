
import { supabase } from './supabaseClient';

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
 * Uploads CSV data to Supabase storage
 * Returns the URL where the file can be accessed
 */
export const uploadToCloud = async (csvData: string): Promise<boolean> => {
  try {
    // Generate a unique filename using timestamp
    const timestamp = new Date().getTime();
    const filename = `trivia_questions_${timestamp}.csv`;
    
    // Convert CSV string to File object
    const file = new File([csvData], filename, { type: 'text/csv' });
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('trivia-questions')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading to Supabase:', error);
      return false;
    }
    
    // Store metadata in a table for easy access
    const { error: dbError } = await supabase
      .from('trivia_files')
      .insert({
        filename: filename,
        created_at: new Date().toISOString(),
        path: data?.path || '',
        download_url: getFilePublicUrl(filename),
        active: true
      });
    
    if (dbError) {
      console.error('Error storing metadata:', dbError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error during upload:', err);
    return false;
  }
};

/**
 * Helper function to get the public URL of a file
 */
const getFilePublicUrl = (filename: string): string => {
  const { data } = supabase.storage
    .from('trivia-questions')
    .getPublicUrl(filename);
  
  return data.publicUrl;
};
