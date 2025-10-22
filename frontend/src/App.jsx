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

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/users/me', {
        credentials: 'include',
      });
      if(response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      print("사용자를 찾을 수 없음:", error);
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 로그인 성공 시 user 상태 업데이트
  const handleLogin = () => {
    fetchUser();
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      print("로그아웃 에러 발생", error)
    } finally {
      setUser(null);
    }
  };

  if (!isAuthReady) {
    return <div>애플리케이션을 로드 중입니다</div>
  }

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage user={user} handleLogout={handleLogout} />} />
        <Route path="/categories/:categoryName" element={<HomePage user={user} handleLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/sell" element={<SellPage user={user} handleLogout={handleLogout} isAuthReady={isAuthReady} />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;