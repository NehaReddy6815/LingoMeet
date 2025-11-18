import { transcribeBuffer } from './stt/whisper.js';
import { translateText } from './translation/lingoTranslator.js';

// pipeline: receives audio chunk, runs STT, translates per-user, emits subtitles
function createPipeline(io) {
  async function handleAudioChunk({ userId, meetingId, chunk, socketId }) {
    try {
      console.log(`🔊 Received audio chunk from ${userId} size=${chunk ? chunk.length || chunk.byteLength : 0} at ${new Date().toISOString()}`);

      // Ensure chunk is a Buffer
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

      // STT
      const { text, language } = await transcribeBuffer(buffer);
      console.log('📝 STT result:', { userId, text, language });

      if (!text) return;

      // Emit transcript event to the meeting room (if meetingId provided)
      if (meetingId) {
        io.in(meetingId).emit('transcript', {
          type: 'transcript',
          userId,
          text,
          isFinal: true,
          language,
        });
      }

      // Broadcast per connected user in the meeting
      if (meetingId) {
        const sockets = await io.in(meetingId).fetchSockets();

        for (const s of sockets) {
          const targetLang = (s.data && s.data.language) || 'en';
          let translatedText = text;

          // Normalize language codes (extract language part from locale, e.g., "en-US" -> "en")
          const normalizeLang = (lang) => {
            if (!lang || lang === 'auto' || lang === 'unknown') return null;
            return lang.split('-')[0].toLowerCase();
          };

          const sourceLangNorm = normalizeLang(language);
          const targetLangNorm = normalizeLang(targetLang);

          if (targetLangNorm && sourceLangNorm && targetLangNorm !== sourceLangNorm) {
            try {
              translatedText = await translateText(text, sourceLangNorm, targetLangNorm);
            } catch (err) {
              console.error('Translation failed:', err.message || err);
              translatedText = text;
            }
          }

          // emit lightweight subtitle to each listener socket
          io.to(s.id).emit('subtitle', {
            userId,
            translatedText,
            sourceLang: language,
            targetLang,
            speakerName: userId,
          });
        }
      }
    } catch (err) {
      console.error('pipeline.handleAudioChunk error:', err.message || err);
    }
  }

  return { handleAudioChunk };
}

export { createPipeline };
