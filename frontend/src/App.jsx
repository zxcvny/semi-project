import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SellPage from './pages/SellPage';

import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage user={user} handleLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/sell" element={<SellPage user={user} handleLogout={handleLogout} isAuthReady={isAuthReady} />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;