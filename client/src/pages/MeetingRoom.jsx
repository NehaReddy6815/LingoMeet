import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Globe, Users } from 'lucide-react';
import socket from "../socket";
import LiveSubtitles from '../components/LiveSubtitles';

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
          {isSpeaking && <Mic className="w-5 h-5 text-green-400" />}
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
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get language and name from URL
  const urlLanguage = searchParams.get('language') || 'en-US';
  const urlName = searchParams.get('name') || 'You';
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(urlLanguage);
  const [transcripts, setTranscripts] = useState([]);
  const [participants] = useState([
    { name: urlName, language: urlLanguage, isSpeaking: false }
  ]);
  const [micPermission, setMicPermission] = useState('unknown');
  const [recorderState, setRecorderState] = useState('inactive');
  const [lastChunkSize, setLastChunkSize] = useState(0);
  const [socketConnectedState, setSocketConnectedState] = useState(socket && socket.connected);

  // Join meeting room on load
  useEffect(() => {
    console.log('Joining meeting with language:', selectedLanguage);
    socket.emit("join-meeting", { meetingId, language: selectedLanguage });
    
    return () => {
      socket.emit("leave-meeting", { meetingId });
    };
  }, [meetingId, selectedLanguage]);

  

  // Speech recognition
  useEffect(() => {
    // Use MediaRecorder to capture microphone audio in small chunks and send to server
    let mediaStream = null;
    let mediaRecorder = null;
    let isRecording = false;
    let socketConnected = socket && socket.connected;

    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('getUserMedia not supported in this browser');
          return;
        }

        console.log('Requesting microphone permission...');
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted, tracks:', mediaStream.getAudioTracks().length);

        // prefer webm/opus if available, otherwise try other common audio mime types
        const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
        let mimeType = '';
        for (const t of preferredTypes) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
            mimeType = t;
            break;
          }
        }
        if (!mimeType) mimeType = undefined; // let browser pick default

        try {
          mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
        } catch (err) {
          console.warn('MediaRecorder constructor failed with mime', mimeType, err);
          mediaRecorder = new MediaRecorder(mediaStream);
        }

        mediaRecorder.addEventListener('start', () => {
          isRecording = true;
          console.log('MediaRecorder started, mimeType=', mimeType, 'state=', mediaRecorder.state);
          try { setRecorderState(mediaRecorder.state); } catch (e) {}
        });

        mediaRecorder.addEventListener('stop', () => {
          isRecording = false;
          console.log('MediaRecorder stopped');
          try { setRecorderState(mediaRecorder.state); } catch (e) {}
        });

        mediaRecorder.addEventListener('error', (e) => {
          console.error('MediaRecorder error:', e);
        });

        mediaRecorder.addEventListener('dataavailable', async (ev) => {
          if (!ev.data || ev.data.size === 0) return;
          try {
            const blob = ev.data;
            const arrayBuffer = await blob.arrayBuffer();
            console.log('Captured audio chunk size:', arrayBuffer.byteLength);
            try { setLastChunkSize(arrayBuffer.byteLength); } catch (e) {}

            if (!socket || !socket.connected) {
              console.warn('Socket not connected, dropping audio chunk');
              return;
            }

            // send binary ArrayBuffer via socket.io
            socket.emit('audio-chunk', { userId: socket.id, meetingId, chunk: arrayBuffer });
            console.log('Sent audio-chunk to server, socket id:', socket.id);
          } catch (err) {
            console.error('Failed to process audio chunk:', err);
          }
        });

        // Start with small timeslice ~180ms
        const timeslice = 180;
        try {
          mediaRecorder.start(timeslice);
          console.log(`Recorder started with ${timeslice}ms timeslice`);
        } catch (err) {
          console.warn('mediaRecorder.start failed with timeslice, starting without timeslice', err);
          mediaRecorder.start();
        }
      } catch (err) {
        console.error('Could not start recording:', err);
      }
    };

    const stopRecording = () => {
      try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        if (mediaStream) {
          mediaStream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        console.warn('Error stopping recorder:', err);
      }
    };

    // Wait for socket connection before starting recording to avoid dropped chunks
    if (isMicOn) {
      if (socket && socket.connected) {
        startRecording();
      } else {
        console.log('Socket not connected yet, waiting to start recorder...');
        const onConnect = () => {
          console.log('Socket connected, starting recorder');
          startRecording();
          socket.off('connect', onConnect);
        };
        socket.on('connect', onConnect);
      }
    }

    // Update socket connection indicator
    const onSocketConnect = () => setSocketConnectedState(true);
    const onSocketDisconnect = () => setSocketConnectedState(false);
    if (socket) {
      socket.on('connect', onSocketConnect);
      socket.on('disconnect', onSocketDisconnect);
    }

    return () => {
      try {
        if (socket) {
          socket.off('connect', onSocketConnect);
          socket.off('disconnect', onSocketDisconnect);
        }
      } catch (e) {}
      stopRecording();
    };
  }, [isMicOn, selectedLanguage, meetingId]);

  const leaveMeeting = () => {
    socket.emit("leave-meeting", { meetingId });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header meetingId={meetingId} />
      {/* Debug panel */}
      <div className="fixed top-20 right-6 w-72 bg-gray-800/80 p-3 rounded-md border border-gray-700 text-sm z-50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Debug</span>
          <span className="text-xs text-gray-400">Socket: {socketConnectedState ? 'connected' : 'disconnected'}</span>
        </div>
        <div className="text-xs text-gray-300">Mic: {micPermission}</div>
        <div className="text-xs text-gray-300">Recorder: {recorderState}</div>
        <div className="text-xs text-gray-300">Last chunk: {lastChunkSize} bytes</div>
        <div className="mt-2">
          <button
            className="w-full bg-purple-600 text-white text-xs py-1 rounded"
            onClick={() => setIsMicOn(s => !s)}
          >{isMicOn ? 'Stop Mic' : 'Start Mic'}</button>
        </div>
      </div>
      <div className="pt-20 px-4 pb-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4 h-full">
                {participants.map((p, i) => (
                  <ParticipantTile key={i} {...p} />
                ))}
                {[1, 2, 3].map(i => (
                  <div key={i} className="relative bg-gray-800/50 rounded-2xl border-2 border-gray-700 border-dashed flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">Waiting for participants...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Live Transcript
                </h3>
              </div>
              
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Your Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="te-IN">Telugu</option>
                  <option value="ta-IN">Tamil</option>
                  <option value="bn-IN">Bengali</option>
                  <option value="es-ES">Spanish</option>
                  <option value="ar-SA">Arabic</option>
                  <option value="zh-CN">Mandarin</option>
                </select>
              </div>
              <div className="space-y-3 h-96">
                <LiveSubtitles />
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
              icon={MessageSquare}
              label="Chat"
              isActive={showChat}
              onClick={() => setShowChat(!showChat)}
            />
            <ControlButton
              icon={Phone}
              label="Leave"
              variant="danger"
              onClick={leaveMeeting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}