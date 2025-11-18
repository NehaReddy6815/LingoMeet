import { io } from "socket.io-client";

// Single stable socket instance for the whole app
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

// Connection lifecycle logs (won't recreate on rerenders)
socket.on("connect", () => {
  console.log(`socket connected: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  console.log(`socket disconnected: ${reason}`);
});

socket.on("connect_error", (err) => {
  console.error("socket connect_error:", err.message);
});

// Log incoming subtitle events centrally for debugging
socket.on("subtitle", (payload) => {
  console.log("socket subtitle:", payload);
});

export default socket;