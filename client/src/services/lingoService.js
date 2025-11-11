// Simple translation service using Lingo.dev
const LINGO_API_KEY = process.env.REACT_APP_LINGO_API_KEY;
const LINGO_PROJECT_ID = process.env.REACT_APP_LINGO_PROJECT_ID;

export const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const response = await fetch('https://api.lingo.dev/v1/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINGO_API_KEY}`,
        'X-Project-ID': LINGO_PROJECT_ID
      },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        context: 'meeting-conversation'
      })
    });

    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original
  }
};

// Batch translate multiple texts at once
export const batchTranslate = async (texts, sourceLanguage, targetLanguage) => {
  try {
    const response = await fetch('https://api.lingo.dev/v1/translate/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINGO_API_KEY}`,
        'X-Project-ID': LINGO_PROJECT_ID
      },
      body: JSON.stringify({
        texts,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        context: 'meeting-conversation'
      })
    });

    const data = await response.json();
    return data.translations || texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
};

export default { translateText, batchTranslate };
