import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import MainDashboard from './pages/MainDashboard';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<MainDashboard/>} />
    </Routes>
  </Router>
  );
}

export default App;
