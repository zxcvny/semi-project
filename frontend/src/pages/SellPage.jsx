import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/layout/Header'

import '../styles/SellPage.css'

const SellPage = ({ user }) => {

  const navigate = useNavigate();
  const alertShown = useRef(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!user && !alertShown.current) {
      alertShown.current = true;
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인하시겠습니까?')) {
        navigate('/login');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
    </>
  )
}

export default SellPage;