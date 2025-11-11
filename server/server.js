import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server + websocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow your React app to connect
  },
});

// When a user connects to socket
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  // Join meeting room
  socket.on("join-meeting", ({ meetingId, language }) => {
    socket.join(meetingId);
    socket.data.language = language; // store user's preferred lang
    console.log(`✅ ${socket.id} joined ${meetingId} (${language})`);
  });

  // When speech text is received from one user
  socket.on("speech-text", async ({ meetingId, text }) => {
  const sourceLang = socket.data.language || "en";

  const sockets = await io.in(meetingId).fetchSockets();

  for (let user of sockets) {
    const targetLang = user.data.language || "en";

    let translatedText = text;

    if (sourceLang !== targetLang) {
      try {
        const response = await axios.post(process.env.LINGO_API_URL, {
          text,
          source: sourceLang,
          target: targetLang
        }, {
          headers: { Authorization: `Bearer ${process.env.LINGO_API_KEY}` }
        });

        translatedText = response.data.text;
      } catch (err) {
        console.log("Translation error:", err.message);
      }
    }

    io.to(user.id).emit("receive-text", {
      sender: socket.id,
      text: translatedText,
      language: targetLang
    });
  }
});


  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
