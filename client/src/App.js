import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreateMeeting />} />
      <Route path="/join" element={<JoinMeeting />} />
      <Route path="/meeting/:id" element={<MeetingRoom />} />
    </Routes>
  );
}
