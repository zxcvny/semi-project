import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SellPage from './pages/SellPage';
import MyInfoPage from './pages/MyInfoPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductEditPage from './pages/ProductEditPage';

import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        credentials: 'include',
      });
      if(response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error);
      setUser(null);
      return false;
    } finally {

    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      setIsAuthReady(true);
    };
    checkAuth();
  }, []);

  // 로그인 성공 시 user 상태 업데이트
  const handleLogin = async () => {
    return await fetchUser();
  };

  // 로그아웃
  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      
    }
    try {
      await fetch('http://localhost:8000/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("로그아웃 에러 발생", error)
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
        <Route
            path="/products/:productId"
            element={<ProductDetailPage user={user} handleLogout={handleLogout} />}
        />
        <Route
            path="/products/:productId/edit"
            element={<ProductEditPage user={user} handleLogout={handleLogout} isAuthReady={isAuthReady} />}
        />
        <Route
            path="/myinfo"
            element={<MyInfoPage user={user} handleLogout={handleLogout} />}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;