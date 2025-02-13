import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import MainDashboard from './pages/MainDashboard';
import MyPage from './pages/mypage';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<MainDashboard/>} />
      <Route path="/my" element={<MyPage/>} />

    </Routes>
  </Router>
  );
}

export default App;
