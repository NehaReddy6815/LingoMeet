import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFF]">
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        Welcome to <span className="text-indigo-600">LingoMeet</span> 🎉
      </h1>

      <p className="text-gray-600 mb-10 text-lg">
        Meet. Speak. Understand — in any language.
      </p>

      <div className="flex gap-6">
        <Link to="/create">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:scale-105 transition">
            Create Meeting
          </button>
        </Link>

        <Link to="/join">
          <button className="px-6 py-3 bg-amber-400 text-white rounded-xl shadow hover:scale-105 transition">
            Join Meeting
          </button>
        </Link>
      </div>
    </div>
  );
}
