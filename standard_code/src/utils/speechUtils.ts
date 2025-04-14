// src/utils/speechUtils.ts

export const speakWithEspeakNg = async (text: string): Promise<void> => {
  try {
    const response = await fetch('http://localhost:8083/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger narration');
    }

    await response.json(); // Wait for narration to complete
  } catch (error) {
    console.error('Narration error:', error);
  }
};
