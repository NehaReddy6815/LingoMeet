import { useState } from "react";
import { uniqueNamesGenerator, adjectives, animals, NumberDictionary } from "unique-names-generator";

import { useNavigate } from "react-router-dom";

export default function CreateMeeting() {
  const navigate = useNavigate();
  const [id, setId] = useState("");

  const generateID = () => {
    const newID = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, NumberDictionary.generate()],

      separator: "-",
      length: 3,
    });
    setId(newID);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFF]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Meeting</h2>

      {id && <div className="mb-4 text-indigo-600 font-semibold text-xl">{id}</div>}

      <button
        onClick={generateID}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:scale-105 transition mb-4"
      >
        Generate Meeting ID
      </button>

      <button
        onClick={() => navigate(`/meeting/${id}`)}
        disabled={!id}
        className="px-6 py-3 bg-amber-400 text-white rounded-xl shadow disabled:opacity-50 hover:scale-105 transition"
      >
        Start Meeting 🚀
      </button>
    </div>
  );
}
