import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createPipeline } from "./src/pipeline.js";
import { setPreferredLanguage, setSocketId, removeUser } from "./src/sessions/store.js";
import { translateText } from "./src/translation/lingoTranslator.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// simple health endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Emit a test subtitle to a meeting (for debugging client subtitle delivery)
app.post('/emit-test', (req, res) => {
  const { meetingId, text = 'Test subtitle', sourceLang = 'en', targetLang = 'en' } = req.body || {};
  if (!meetingId) return res.status(400).json({ error: 'meetingId required' });

  // send to all sockets in the room
  io.in(meetingId).fetchSockets().then(sockets => {
    sockets.forEach(s => {
      io.to(s.id).emit('subtitle', {
        userId: 'server-test',
        translatedText: text,
        sourceLang,
        targetLang,
        speakerName: 'Server'
      });
    });
    res.json({ ok: true, sent: sockets.length });
  }).catch(err => {
    console.error('emit-test error', err);
    res.status(500).json({ error: String(err) });
  });
});

// Create HTTP server + websocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const pipeline = createPipeline(io);

// When a user connects to socket
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id, 'from', socket.handshake.address);

  socket.on('join-meeting', ({ meetingId, language, userId }) => {
    socket.join(meetingId);
    setPreferredLanguage(socket.id, language || 'en');
    setSocketId(socket.id, socket.id);
    socket.data.language = language;
    console.log(`✅ ${socket.id} joined ${meetingId} (${language})`);
  });

  // Audio-chunk handler
  socket.on('audio-chunk', async (payload) => {
    // payload: { userId, meetingId, chunk }
    try {
      const { userId, meetingId, chunk } = payload || {};
      if (!chunk) {
        console.warn('Received empty audio chunk');
        return;
      }

      const isBuffer = Buffer.isBuffer(chunk);
      // Socket.io may deliver ArrayBuffer - convert if needed
      const buffer = isBuffer ? chunk : Buffer.from(chunk);

      console.log(`Received audio-chunk from ${userId || socket.id} size=${buffer.byteLength} bytes at ${new Date().toISOString()}`);

      // Hand off to pipeline
      pipeline.handleAudioChunk({ userId: userId || socket.id, meetingId, chunk: buffer, socketId: socket.id });
    } catch (err) {
      console.error('audio-chunk handler error:', err.message || err);
    }
  });

  socket.on('leave-meeting', ({ meetingId }) => {
    socket.leave(meetingId);
    removeUser(socket.id);
    console.log(`${socket.id} left ${meetingId}`);
  });

  // Optional: receive speech text from client (browser SpeechRecognition fallback)
  socket.on('speech-text', async ({ meetingId, text }) => {
    try {
      const sourceLang = socket.data.language || 'en';
      const sockets = await io.in(meetingId).fetchSockets();

      for (let s of sockets) {
        const targetLang = (s.data && s.data.language) || 'en';
        let translatedText = text;
        if (targetLang && sourceLang && targetLang !== sourceLang) {
          try {
            translatedText = await translateText(text, sourceLang, targetLang);
          } catch (err) {
            console.error('Translation error (speech-text):', err.message || err);
            translatedText = text;
          }
        }

        io.to(s.id).emit('subtitle', {
          userId: socket.id,
          translatedText,
          sourceLang: sourceLang,
          targetLang,
          speakerName: socket.id,
        });
      }
    } catch (err) {
      console.error('speech-text handler error:', err.message || err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
