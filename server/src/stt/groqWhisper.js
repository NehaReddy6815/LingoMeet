// server/src/stt/groqWhisper.js
import Groq from "groq-sdk";
import fs from "fs";
import os from "os";
import path from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Build a valid .webm file from buffered raw chunks.
 * chunks: Array<Buffer>
 */
export async function transcribeBufferedChunks(chunks) {
  if (!chunks || chunks.length === 0) {
    return { text: "", language: "unknown" };
  }

  const combined = Buffer.concat(chunks);
  const tmpPath = path.join(
    os.tmpdir(),
    `lingomeet_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`
  );
  fs.writeFileSync(tmpPath, combined);

  try {
    const result = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: "whisper-large-v3",
    });

    return {
      text: (result?.text || "").trim(),
      language: result?.language || "auto",
    };
  } catch (err) {
    console.error("❌ Groq STT Error:", err.message || err);
    return { text: "", language: "unknown" };
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch {}
  }
}
