import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          LingoMeet
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-indigo-600 transition">Home</a>
          <a href="/create" className="hover:text-indigo-600 transition">Create Meeting</a>
          <a href="/join" className="hover:text-indigo-600 transition">Join Meeting</a>

          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Sign In
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col bg-white border-t border-gray-200 px-6 py-4 space-y-3 text-gray-700 font-medium">
          <a href="/" className="hover:text-indigo-600 transition">Home</a>
          <a href="/create" className="hover:text-indigo-600 transition">Create Meeting</a>
          <a href="/join" className="hover:text-indigo-600 transition">Join Meeting</a>

          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Sign In
          </button>
        </div>
      )}
    </header>
  );
}
