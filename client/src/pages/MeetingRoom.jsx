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

  const urlLanguage = searchParams.get('language') || 'en-US';
  const urlName = searchParams.get('name') || 'You';

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(urlLanguage);
  const [participants] = useState([{ name: urlName, language: urlLanguage, isSpeaking: false }]);
  const [micPermission, setMicPermission] = useState('unknown');
  const [recorderState, setRecorderState] = useState('inactive');
  const [lastChunkSize, setLastChunkSize] = useState(0);
  const [socketConnectedState, setSocketConnectedState] = useState(socket && socket.connected);
  const [micTestResults, setMicTestResults] = useState([]);
  const [useBrowserStt, setUseBrowserStt] = useState(false);
  const speechRecognitionRef = useRef(null);
  const [meetingJoined, setMeetingJoined] = useState(false);

  // Buffering refs
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pendingChunksRef = useRef([]);           // array of Blob pieces
  const pendingSizeRef = useRef(0);              // byte length accumulated
  const lastSendAtRef = useRef(Date.now());      // timestamp
  const sendTimerRef = useRef(null);

  const localeToLanguage = (locale) => {
    if (!locale) return 'en';
    const parts = locale.split('-');
    return parts[0] || locale;
  };

  useEffect(() => {
    if (!meetingId || !socket) return;

    const joinMeeting = () => {
      console.log('Joining meeting with language:', selectedLanguage);
      const languageCode = localeToLanguage(selectedLanguage);
      socket.emit("join-meeting", { meetingId, language: languageCode });
      setMeetingJoined(true);
    };

    if (socket.connected) {
      joinMeeting();
    } else {
      const onConnectHandler = () => {
        console.log('Socket connected, joining meeting');
        joinMeeting();
        socket.off('connect', onConnectHandler);
      };
      socket.on('connect', onConnectHandler);
    }

    return () => {
      setMeetingJoined(false);
      if (socket && meetingId) {
        socket.emit("leave-meeting", { meetingId });
      }
    };
  }, [meetingId, selectedLanguage]);

  // Helper: send buffered chunks combined as a single blob
  const flushAndSendBuffer = async (meetingIdParam) => {
    const chunks = pendingChunksRef.current;
    if (!chunks || chunks.length === 0) return;
    const blob = new Blob(chunks, { type: "audio/webm" });
    try {
      const arrayBuffer = await blob.arrayBuffer();

      setLastChunkSize(arrayBuffer.byteLength);
      // send only if socket connected
      if (socket && socket.connected) {
        socket.emit('audio-chunk', { userId: socket.id, meetingId: meetingIdParam, chunk: arrayBuffer });
        // debug log
        // console.log('Flushed & sent combined blob bytes:', arrayBuffer.byteLength);
      }

    } catch (err) {
      console.error('Error building combined blob:', err);
    } finally {
      // reset buffer
      pendingChunksRef.current = [];
      pendingSizeRef.current = 0;
      lastSendAtRef.current = Date.now();
    }
  };

  // Start MediaRecorder and buffering
  useEffect(() => {
    let localShouldStart = false;

    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('getUserMedia not supported in this browser');
          setMicPermission('unsupported');
          return;
        }

        setMicPermission('requesting');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicPermission('granted');

        // pick best mimeType for your browser
        const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
        let mimeType = '';
        for (const t of preferredTypes) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
            mimeType = t;
            break;
          }
        }
        if (!mimeType) mimeType = undefined;

        let mr;
        try {
          mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch (err) {
          console.warn('MediaRecorder constructor failed with mime', mimeType, err);
          mr = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = mr;

        mr.onstart = () => { setRecorderState('recording'); /*console.log('MediaRecorder start');*/ };
        mr.onstop = () => { setRecorderState('stopped'); /*console.log('MediaRecorder stop');*/ };
        mr.onerror = (e) => console.error('MediaRecorder error', e);

        // push fragment to buffer — but DO NOT send immediately; we will flush combined Blobs at intervals
        mr.ondataavailable = async (ev) => {
          if (!ev.data || ev.data.size === 0) return;
          try {
            pendingChunksRef.current.push(ev.data);
            pendingSizeRef.current += ev.data.size;
            // If sized large enough or time passed, flush
            const now = Date.now();
            const sizeThreshold = 12_000; // bytes
            const timeThreshold = 1500; // ms

            const timeSinceLast = now - lastSendAtRef.current;
            if (pendingSizeRef.current >= sizeThreshold || timeSinceLast >= timeThreshold) {
              // clear any pending timer
              if (sendTimerRef.current) {
                clearTimeout(sendTimerRef.current);
                sendTimerRef.current = null;
              }
              await flushAndSendBuffer(meetingId);
            } else {
              // schedule flush after small delay so we don't send too often
              if (!sendTimerRef.current) {
                sendTimerRef.current = setTimeout(() => {
                  flushAndSendBuffer(meetingId);
                  sendTimerRef.current = null;
                }, timeThreshold);
              }
            }
          } catch (err) {
            console.error('Failed to process audio chunk (buffering):', err);
          }
        };

        // start with a small timeslice so we get low-latency chunks
        try {
          mr.start(200); // 200 ms slices
        } catch (err) {
          console.warn('mr.start failed with timeslice, starting without timeslice', err);
          mr.start();
        }
      } catch (err) {
        console.error('Could not start recording:', err);
        setMicPermission('denied');
      }
    };

    const stopRecording = () => {
      try {
        const mr = mediaRecorderRef.current;
        if (mr && mr.state !== 'inactive') mr.stop();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        // flush remaining buffered chunks
        flushAndSendBuffer(meetingId).catch(() => {});
      } catch (err) {
        console.warn('Error stopping recorder:', err);
      }
    };

    // only start when mic on, meeting joined and socket connected
    if (isMicOn && meetingId && socket && socket.connected && meetingJoined) {
      localShouldStart = true;
      startRecording();
    }

    // listen for socket connect/disconnect to restart recorder if needed
    const onSocketConnect = () => {
      setSocketConnectedState(true);
      if (isMicOn && meetingId && meetingJoined && !mediaRecorderRef.current) {
        startRecording();
      }
    };
    const onSocketDisconnect = () => setSocketConnectedState(false);
    socket.on('connect', onSocketConnect);
    socket.on('disconnect', onSocketDisconnect);

    return () => {
      socket.off('connect', onSocketConnect);
      socket.off('disconnect', onSocketDisconnect);
      if (localShouldStart) stopRecording();
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
    };
  }, [isMicOn, selectedLanguage, meetingId, meetingJoined]);

  const leaveMeeting = () => {
    socket.emit("leave-meeting", { meetingId });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header meetingId={meetingId} />
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
          <button
            className="w-full bg-gray-700 text-white text-xs py-1 rounded mt-2"
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mr = new MediaRecorder(stream);
                const chunks = [];
                mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data.size); };
                mr.start(250);
                setTimeout(() => { mr.stop(); }, 2000);
                mr.onstop = () => {
                  stream.getTracks().forEach(t => t.stop());
                  setMicTestResults(chunks);
                  console.log('Mic test chunk sizes:', chunks);
                };
              } catch (err) {
                console.error('Mic test failed:', err);
                setMicTestResults([`error: ${err.message || err}`]);
              }
            }}
          >Test Mic</button>
          <button
            className={`w-full text-xs py-1 rounded mt-2 ${useBrowserStt ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
            onClick={() => {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (!SpeechRecognition) {
                alert('Browser SpeechRecognition not supported');
                return;
              }

              if (useBrowserStt) {
                try { speechRecognitionRef.current?.stop(); } catch (e) {}
                speechRecognitionRef.current = null;
                setUseBrowserStt(false);
                return;
              }

              const recog = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
              recog.lang = selectedLanguage || 'en-US';
              recog.continuous = true;
              recog.interimResults = false;

              recog.onresult = (e) => {
                const spokenText = e.results[e.resultIndex][0].transcript;
                console.log('Browser STT recognized:', spokenText);
                socket.emit('speech-text', { meetingId, text: spokenText });
              };

              recog.onerror = (err) => console.error('SpeechRecognition error', err);
              recog.onend = () => { setUseBrowserStt(false); speechRecognitionRef.current = null; };

              try {
                recog.start();
                speechRecognitionRef.current = recog;
                setUseBrowserStt(true);
              } catch (err) {
                console.error('Failed to start SpeechRecognition', err);
                alert('Failed to start SpeechRecognition: ' + err.message);
              }
            }}
          >{useBrowserStt ? 'Stop Browser STT' : 'Use Browser STT'}</button>
        </div>
      </div>

      {micTestResults.length > 0 && (
        <div className="fixed top-44 right-6 w-72 bg-gray-800/80 p-2 rounded-md border border-gray-700 text-xs z-50">
          <div className="text-gray-300 font-semibold mb-1">Mic Test Results</div>
          <div className="text-gray-200">{micTestResults.join(', ')}</div>
        </div>
      )}

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
