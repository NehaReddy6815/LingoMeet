import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CreateMeeting from "./pages/CreateMeeting.jsx";
import JoinMeeting from "./pages/JoinMeeting.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import Header from "./components/Header.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="/join" element={<JoinMeeting />} />
        <Route path="/meeting/:id" element={<MeetingRoom />} />
      </Routes>
    </>
  );
}
