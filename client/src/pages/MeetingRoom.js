import { useParams, useNavigate } from "react-router-dom";

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-5xl mx-auto flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Meeting: <span className="text-indigo-600">{id}</span>
        </h1>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:scale-105 transition"
        >
          Leave ❌
        </button>
      </div>
    </div>
  );
}
