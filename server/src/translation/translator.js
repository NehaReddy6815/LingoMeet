import axios from 'axios';

const LINGO_URL = process.env.LINGO_API_URL || 'https://api.lingo.dev/translate';
const LINGO_API_KEY = process.env.LINGO_API_KEY;

async function translateText(text, sourceLang, targetLang) {
  if (!text) return '';
  if (!targetLang || targetLang === sourceLang) return text;

  try {
    const body = {
      text,
      target_language: targetLang
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    if (LINGO_API_KEY) headers['Authorization'] = `Bearer ${LINGO_API_KEY}`;

    const res = await axios.post(LINGO_URL, body, { headers });

    // Expecting { translatedText } or similar — handle several shapes
    if (res.data) {
      if (typeof res.data === 'string') return res.data;
      if (res.data.translatedText) return res.data.translatedText;
      if (res.data.translated_text) return res.data.translated_text;
      if (res.data.translation) return res.data.translation;
    }

    return text;
  } catch (err) {
    console.error('Lingo.dev translation error:', err.message || err);
    return text;
  }
}

export { translateText };
