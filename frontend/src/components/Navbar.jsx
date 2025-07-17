import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav>
      <div>
        <Link to="/">Beranda</Link>
        {isLoggedIn && <Link to="/diary">Diary</Link>}
      </div>
      <div>
        <button onClick={toggleTheme} className="nav-theme-toggle">
          {darkMode ? '☀️ Terang' : '🌙 Gelap'}
        </button>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Daftar</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
