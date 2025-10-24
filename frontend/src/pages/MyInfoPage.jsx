import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import WishlistSection from '../components/layout/myinfo/WishlistSection';
import MySellSection from '../components/layout/myinfo/MySellSection';
import UserProfileSection from '../components/layout/myinfo/UserProfileSection';
import '../styles/MyInfoPage.css'; 

// --- MyInfoPage 컴포넌트 ---
const MyInfoPage = ({ user, handleLogout, setUser }) => {
  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      {/* 고유 클래스 */}
      <div className="app my-info-page">
        {/* 내용 컨테이너 */}
        <div className="my-info-container">
          {/* 사용자 정보 섹션 */}
          <UserProfileSection user={user} setUser={setUser} />
         {/* --- 👇 찜 목록 섹션 컴포넌트 렌더링 --- */}
          <WishlistSection user={user} />

          {/* --- 👇 판매 내역 섹션 컴포넌트 렌더링 --- */}
          <MySellSection user={user} />
        </div> {/* my-info-container 끝 */}
      </div> {/* app my-info-page 끝 */}
    </>
  );
};

export default MyInfoPage;