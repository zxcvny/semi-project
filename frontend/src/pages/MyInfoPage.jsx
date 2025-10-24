import { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import WishlistSection from '../components/layout/myinfo/WishlistSection';
import MySellSection from '../components/layout/myinfo/MySellSection';
import '../styles/MyInfoPage.css'; 


// --- MyInfoPage 컴포넌트 ---
const MyInfoPage = ({ user, handleLogout }) => {
  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      {/* 고유 클래스 */}
      <div className="app my-info-page">
        {/* 내용 컨테이너 */}
        <div className="my-info-container">
          {/* 사용자 정보 섹션 */}
          <div className="user-profile-section">
            <h2>{user ? user.nickname : '사용자'}님, 안녕하세요!</h2>
            {/* 프로필 수정 버튼 등 */}
          </div>

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