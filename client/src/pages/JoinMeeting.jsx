import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Globe, ArrowRight, AlertCircle } from 'lucide-react';

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

const PreviewTile = ({ isVideoOn, displayName }) => {
  return (
    <div className="relative bg-gray-800 rounded-3xl overflow-hidden aspect-video border-4 border-purple-500 shadow-2xl">
      {isVideoOn ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
          <div className="w-40 h-40 bg-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            {displayName ? displayName.slice(0, 2).toUpperCase() : 'YO'}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <VideoOff className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-400 text-xl">Camera Off</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
        <p className="text-white font-semibold text-lg">
          {displayName || 'You'}
        </p>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, value, onChange, icon: Icon, error }) => {
  return (
    <div>
      <label className="block text-gray-900 font-bold mb-3 text-lg">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 rounded-xl text-gray-900 text-lg focus:outline-none transition-all ${
            error 
              ? 'border-red-400 focus:border-red-500' 
              : 'border-gray-200 focus:border-purple-500'
          }`}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default function JoinMeeting({ onJoinMeeting }) {
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [errors, setErrors] = useState({});
  
  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'zh-CN', name: 'Mandarin' }
  ];
  
  const validateAndJoin = () => {
    const newErrors = {};
    
    if (!meetingId.trim()) {
      newErrors.meetingId = 'Meeting ID is required';
    } else if (meetingId.length < 3) {
      newErrors.meetingId = 'Please enter a valid meeting ID';
    }
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0 && onJoinMeeting) {
      // Pass meeting ID, language, and name
      onJoinMeeting(meetingId, selectedLanguage, displayName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100">
      <Header />
      
      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Join Meeting
            </h1>
            <p className="text-xl text-purple-800/70">
              Connect with people around the world 🌍
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Preview & Controls */}
            <div className="space-y-8">
              <PreviewTile isVideoOn={isVideoOn} displayName={displayName} />
              
              {/* Device Controls */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Join?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isVideoOn ? (
                        <Video className="w-6 h-6 text-purple-600" />
                      ) : (
                        <VideoOff className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-gray-900 font-semibold">Camera</span>
                    </div>
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        isVideoOn 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {isVideoOn ? 'On' : 'Off'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isMicOn ? (
                        <Mic className="w-6 h-6 text-purple-600" />
                      ) : (
                        <MicOff className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-gray-900 font-semibold">Microphone</span>
                    </div>
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        isMicOn 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {isMicOn ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Join Form */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Meeting Details</h3>
                
                <div className="space-y-6">
                  <InputField
                    label="Meeting ID"
                    placeholder="e.g., 123"
                    value={meetingId}
                    onChange={setMeetingId}
                    error={errors.meetingId}
                  />
                  
                  <InputField
                    label="Your Name"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={setDisplayName}
                    error={errors.displayName}
                  />
                  
                  <div>
                    <label className="block text-gray-900 font-bold mb-3 text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Your Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-lg focus:border-purple-500 focus:outline-none"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                    <p className="text-gray-600 text-sm mt-3">
                      Speak in your language and understand everyone in real-time
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Join Button */}
              <button 
                onClick={validateAndJoin}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                Join Meeting
                <ArrowRight className="w-6 h-6" />
              </button>
              
              {/* Help Text */}
              <div className="bg-purple-100 rounded-2xl p-6">
                <p className="text-purple-900 text-center">
                  <span className="font-bold">First time?</span> Just enter the meeting ID shared with you and your name to get started!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}