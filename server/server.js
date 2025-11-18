import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createPipeline } from "./src/pipeline.js";
import { setPreferredLanguage, setSocketId, removeUser } from "./src/sessions/store.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
  console.log("🔗 User connected:", socket.id);

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

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
