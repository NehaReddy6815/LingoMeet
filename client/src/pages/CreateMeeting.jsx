import React, { useState } from 'react';
import { Copy, Check, Video, Globe, Calendar, Clock, Users } from 'lucide-react';

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

const PreviewTile = ({ isVideoOn }) => {
  return (
    <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video border-4 border-purple-500">
      {isVideoOn ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            MA
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-gray-400 text-lg">Camera Off</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white font-semibold">You</p>
      </div>
    </div>
  );
};

const SettingCard = ({ icon: Icon, title, children }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default function CreateMeeting() {
  const [meetingId] = useState('ABC-DEF-GHI');
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [meetingName, setMeetingName] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  
  const meetingLink = `https://lingomeet.com/join/${meetingId}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const languages = [
    'English', 'Spanish', 'Hindi', 'Mandarin', 'Arabic', 
    'Tamil', 'Telugu', 'Bengali', 'French', 'German', 
    'Japanese', 'Korean', 'Portuguese', 'Russian', 'Italian'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100">
      <Header />
      
      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Create Your Meeting
            </h1>
            <p className="text-xl text-purple-800/70">
              Set up your multilingual meeting in seconds ✨
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Preview */}
            <div className="space-y-6">
              <PreviewTile isVideoOn={isVideoOn} />
              
              {/* Quick Controls */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    isVideoOn 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    isMicOn 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isMicOn ? 'Mute' : 'Unmute'}
                </button>
              </div>
              
              {/* Meeting Link */}
              <SettingCard icon={Copy} title="Meeting Link">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={meetingLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-mono text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </SettingCard>
            </div>
            
            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Meeting Details */}
              <SettingCard icon={Video} title="Meeting Details">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Meeting Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                      placeholder="e.g., Team Standup, Client Call"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="schedule"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <label htmlFor="schedule" className="text-gray-700 font-semibold cursor-pointer">
                      Schedule for later
                    </label>
                  </div>
                  
                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-4 pl-8">
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </SettingCard>
              
              {/* Language Settings */}
              <SettingCard icon={Globe} title="Your Language">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <p className="text-gray-600 text-sm mt-2">
                  Speak in {selectedLanguage} and everyone will understand in their language
                </p>
              </SettingCard>
              
              {/* Advanced Settings */}
              <SettingCard icon={Users} title="Participant Settings">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Allow participants to join before host</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Mute participants on entry</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Enable waiting room</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" />
                  </div>
                </div>
              </SettingCard>
            </div>
          </div>
          
          {/* Start Meeting Button */}
          <div className="mt-12 flex justify-center">
            <button className="px-16 py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-3">
              <Video className="w-6 h-6" />
              Start Meeting Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}