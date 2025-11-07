import React from 'react';
import { Video, Globe, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <span className="text-purple-500">Lingo</span>
          <span className="text-gray-400">Meet</span>
        </div>
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
          MA
        </div>
      </div>
    </header>
  );
};

const TranslationBubble = ({ language, text, isColored, align = "left" }) => {
  const bgColor = isColored ? "bg-purple-600 text-white" : "bg-white text-gray-900";
  const alignClass = align === "right" ? "justify-end" : "justify-start";
  
  return (
    <div className={`flex ${alignClass} mb-6`}>
      <div className={`${bgColor} rounded-3xl px-6 py-5 max-w-md shadow-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm">IN</span>
          <span className={`text-xs font-semibold uppercase ${isColored ? 'text-purple-200' : 'text-gray-500'}`}>
            {language}
          </span>
        </div>
        <p className="text-lg">{text}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, iconColor, title, description, bgGradient }) => {
  return (
    <div className={`${bgGradient} rounded-3xl p-8 shadow-lg`}>
      <div className={`w-14 h-14 ${iconColor} bg-opacity-20 rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className={`w-7 h-7 ${iconColor.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-24 text-center">
        <div className="max-w-6xl mx-auto">
         
          
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-8">
            <span className="text-gray-900">Speak in your language.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-orange-300 via-yellow-300 to-green-300 bg-clip-text text-transparent">
              Understand in theirs.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-800/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Real-time multilingual meetings that break down language barriers.
            <br />
            Perfect for global teams, students, and remote workers. ✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button className="px-10 py-4 bg-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-purple-700 hover:scale-105 transition-all flex items-center gap-3">
              <Video className="h-5 w-5" />
              Create Meeting
            </button>
            <button className="px-10 py-4 bg-white text-gray-900 text-lg font-semibold rounded-full shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-3">
              <Globe className="h-5 w-5" />
              Join Meeting
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            See It In Action 🎯
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Watch real-time translation unfold naturally
          </p>
          
          <div className="space-y-6">
            <TranslationBubble 
              language="HINDI" 
              text="नमस्ते! आप कैसे हैं?"
              isColored={true}
              align="left"
            />
            <TranslationBubble 
              language="TAMIL" 
              text="நான் நன்றாக இருக்கிறேன், நன்றி!"
              isColored={false}
              align="left"
            />
            <TranslationBubble 
              language="TELUGU" 
              text="ప్రాజెక్ట్ గురించి మాట్లాడుకుందాం."
              isColored={true}
              align="left"
            />
            <TranslationBubble 
              language="BENGALI" 
              text="হ্যাঁ, চলুন শুরু করি!"
              isColored={false}
              align="left"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Video}
              iconColor="bg-purple-500"
              title="Instant Meetings"
              description="Create or join meetings in seconds. No downloads, no hassle. 🚀"
              bgGradient="bg-gradient-to-br from-purple-100 to-purple-50"
            />
            <FeatureCard
              icon={Globe}
              iconColor="bg-orange-500"
              title="100+ Languages"
              description="Speak any language and be understood by everyone in the room. 🌍"
              bgGradient="bg-gradient-to-br from-orange-100 to-orange-50"
            />
            <FeatureCard
              icon={Shield}
              iconColor="bg-green-500"
              title="Secure & Private"
              description="End-to-end encryption keeps your conversations safe. 🔒"
              bgGradient="bg-gradient-to-br from-green-100 to-green-50"
            />
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-20"></div>
    </div>
  );
}