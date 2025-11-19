// server/src/pipeline.js
import { transcribeBufferedChunks } from "./stt/groqWhisper.js";
import { translateText } from "./translation/lingoTranslator.js";

// Maintain audio buffers for each speaker
const audioBuffers = new Map();

export function createPipeline(io) {
  async function handleAudioChunk({ userId, meetingId, chunk }) {
    if (!chunk) return;

    // Add chunk to buffer
    if (!audioBuffers.has(userId)) audioBuffers.set(userId, []);
    audioBuffers.get(userId).push(chunk);

    const buffered = audioBuffers.get(userId);
    const totalSize = buffered.reduce((n, b) => n + b.length, 0);

    console.log(`🎤 Buffered size for ${userId}: ${totalSize} bytes`);

    // Only process when large enough (0.5–1s audio)
    if (totalSize < 20000) return; // about 20 KB

    // Build complete file
    const { text, language } = await transcribeBufferedChunks(buffered);

    // Reset buffer after processing
    audioBuffers.set(userId, []);

    if (!text) return;

    console.log(`📝 Final STT: "${text}" lang=${language}`);

    io.in(meetingId).emit("transcript", { userId, text, language });

    // Translate for each listener
    const listeners = await io.in(meetingId).fetchSockets();

    for (const s of listeners) {
      const src = language.split("-")[0];
      const tgt = (s.data?.language || "en").split("-")[0];

      let translated = text;
      if (src !== tgt) {
        try {
          translated = await translateText(text, src, tgt);
        } catch {}
      }

      io.to(s.id).emit("subtitle", {
        userId,
        translatedText: translated,
        sourceLang: src,
        targetLang: tgt,
        speakerName: userId,
      });
    }
  }

  return { handleAudioChunk };
}
