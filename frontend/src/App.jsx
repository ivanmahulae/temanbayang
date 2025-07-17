import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import DiaryPage from './pages/DiaryPage'; 
import Navbar from './components/Navbar';
import StoryDetail from './pages/StoryDetail'; 

function App() {
  return (
    <div className="container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/stories/:id" element={<StoryDetail />} /> 
      </Routes>
    </div>
  );
}

export default App;
