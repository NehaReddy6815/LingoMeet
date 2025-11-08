import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket"; // ✅ Make sure this path is correct

export default function JoinMeeting() {
  const [meetingId, setMeetingId] = useState("");
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const join = () => {
    if (!meetingId.trim()) {
      alert("Please enter a meeting ID");
      return;
    }

    // ✅ Join room + store language preference on backend
    socket.emit("join-meeting", { meetingId, language });

    // ✅ Redirect user to the meeting page
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="pt-32 text-center">
      <h1 className="text-4xl font-bold mb-6">Join Meeting</h1>

      {/* Meeting ID Input */}
      <input
        className="px-4 py-2 border rounded-lg"
        placeholder="Enter Meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />

      {/* Language Select */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-4 py-2 border rounded-lg ml-4"
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="te">Telugu</option>
        <option value="ta">Tamil</option>
        <option value="bn">Bengali</option>
        <option value="es">Spanish</option>
        <option value="ar">Arabic</option>
        <option value="zh">Mandarin</option>
      </select>

      {/* Join Button */}
      <button
        onClick={join}
        className="block mx-auto mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Join Meeting
      </button>
    </div>
  );
}
