import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateMeeting from './pages/CreateMeeting';
import JoinMeeting from './pages/JoinMeeting';
import MeetingRoom from './pages/MeetingRoom';

function LandingPageWithNav() {
  const navigate = useNavigate();
  
  return <LandingPage onCreateMeeting={() => navigate('/create')} onJoinMeeting={() => navigate('/join')} />;
}

function CreateMeetingWithNav() {
  const navigate = useNavigate();
  
  return <CreateMeeting onStartMeeting={(meetingId) => navigate(`/meeting/${meetingId}`)} />;
}

function JoinMeetingWithNav() {
  const navigate = useNavigate();
  
  return <JoinMeeting onJoinMeeting={(meetingId, language, name) => {
    // Pass language and name as URL parameters
    navigate(`/meeting/${meetingId}?language=${language}&name=${encodeURIComponent(name)}`);
  }} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWithNav />} />
        <Route path="/create" element={<CreateMeetingWithNav />} />
        <Route path="/join" element={<JoinMeetingWithNav />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </Router>
  );
}

export default App;