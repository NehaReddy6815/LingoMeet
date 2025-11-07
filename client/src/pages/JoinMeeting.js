import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinMeeting() {
  const [id, setId] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFF]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Join Meeting</h2>

      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Enter Meeting ID"
        className="border p-3 rounded-xl w-72 shadow mb-4"
      />

      <button
        onClick={() => navigate(`/meeting/${id}`)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:scale-105 transition"
      >
        Join 🎧
      </button>
    </div>
  );
}
