// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import {
  setPreferredLanguage,
  setSocketId,
  removeUser,
} from "./src/sessions/store.js";

import { translateText } from "./src/translation/lingoTranslator.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  },
});

// load pipeline
let pipeline = null;
(async () => {
  const mod = await import("./src/pipeline.js");
  pipeline = mod.createPipeline(io);
})();

io.on("connection", (socket) => {
  console.log("🔗 Connected:", socket.id);

  socket.on("join-meeting", ({ meetingId, language }) => {
    socket.join(meetingId);
    socket.data.language = language || "en";
    setPreferredLanguage(socket.id, socket.data.language);
    setSocketId(socket.id, socket.id);
  });

  // final single audio-chunk handler
  socket.on("audio-chunk", async ({ userId, meetingId, chunk }) => {
    if (!pipeline) return;
    if (!chunk) return;

    const buffer = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk);

    await pipeline.handleAudioChunk({
      userId: userId || socket.id,
      meetingId,
      chunk: buffer,
      socketId: socket.id,
    });
  });

  socket.on("leave-meeting", ({ meetingId }) => {
    socket.leave(meetingId);
    removeUser(socket.id);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running")
);
