import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Users, MessageSquare, Globe } from 'lucide-react';

const Header = ({ meetingId }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <span className="text-purple-500">Lingo</span>
          <span className="text-gray-400">Meet</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Meeting ID: {meetingId}</span>
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            MA
          </div>
        </div>
      </div>
    </header>
  );
};

const ParticipantTile = ({ name, language, isSpeaking }) => {
  const borderColor = isSpeaking ? 'border-green-400 border-4' : 'border-gray-700 border-2';
  
  return (
    <div className={`relative bg-gray-800 rounded-2xl overflow-hidden aspect-video ${borderColor} transition-all`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{name}</p>
            <p className="text-purple-300 text-sm flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {language}
            </p>
          </div>
          <Mic className="w-5 h-5 text-green-400" />
        </div>
      </div>
    </div>
  );
};

const TranscriptMessage = ({ name, language, text, timestamp }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-white">{name}</span>
        <span className="text-purple-400 text-xs uppercase font-semibold">{language}</span>
        <span className="text-gray-500 text-xs ml-auto">{timestamp}</span>
      </div>
      <p className="text-gray-300">{text}</p>
    </div>
  );
};

const ControlButton = ({ icon: Icon, label, isActive, onClick, variant = 'default' }) => {
  const bgColor = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700' 
    : isActive 
    ? 'bg-purple-600 hover:bg-purple-700' 
    : 'bg-gray-700 hover:bg-gray-600';
  
  return (
    <button
      onClick={onClick}
      className={`${bgColor} text-white p-4 rounded-full transition-all hover:scale-110 flex flex-col items-center gap-2`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default function MeetingRoom() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  const meetingId = 'ABC-DEF-GHI';
  
  const participants = [
    { name: 'Maria Gonzalez', language: 'Spanish', isSpeaking: true },
    { name: 'Raj Kumar', language: 'Hindi', isSpeaking: false },
    { name: 'Sophie Chen', language: 'Mandarin', isSpeaking: false },
    { name: 'Ahmed Hassan', language: 'Arabic', isSpeaking: false }
  ];
  
  const transcripts = [
    { name: 'Maria', language: 'Spanish', text: 'Hello everyone! Ready to start the presentation?', timestamp: '10:32 AM' },
    { name: 'Raj', language: 'Hindi', text: 'Yes, I have the slides prepared. Let me share my screen.', timestamp: '10:33 AM' },
    { name: 'Sophie', language: 'Mandarin', text: 'Perfect timing! I just joined.', timestamp: '10:33 AM' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header meetingId={meetingId} />
      
      <div className="pt-20 px-4 pb-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
            {/* Main Video Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 h-full">
                {participants.map((participant, index) => (
                  <ParticipantTile key={index} {...participant} />
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Live Transcript
                </h3>
                <button className="text-purple-400 hover:text-purple-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              {/* Language Selector */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Your Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>Hindi</option>
                  <option>Mandarin</option>
                  <option>Arabic</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Bengali</option>
                </select>
              </div>
              
              {/* Transcripts */}
              <div className="space-y-3">
                {transcripts.map((transcript, index) => (
                  <TranscriptMessage key={index} {...transcript} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-6">
            <ControlButton
              icon={isMicOn ? Mic : MicOff}
              label={isMicOn ? 'Mute' : 'Unmute'}
              isActive={isMicOn}
              onClick={() => setIsMicOn(!isMicOn)}
            />
            <ControlButton
              icon={isVideoOn ? Video : VideoOff}
              label={isVideoOn ? 'Stop Video' : 'Start Video'}
              isActive={isVideoOn}
              onClick={() => setIsVideoOn(!isVideoOn)}
            />
            <ControlButton
              icon={Users}
              label="Participants"
              isActive={false}
              onClick={() => {}}
            />
            <ControlButton
              icon={MessageSquare}
              label="Chat"
              isActive={showChat}
              onClick={() => setShowChat(!showChat)}
            />
            <ControlButton
              icon={Settings}
              label="Settings"
              isActive={false}
              onClick={() => {}}
            />
            <ControlButton
              icon={Phone}
              label="Leave"
              variant="danger"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}