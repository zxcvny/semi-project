import { useState, useEffect } from 'react'; // useEffect 제거 가능
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
// ProductCarousel 대신 개별 섹션 컴포넌트 import
import WishlistSection from '../components/myinfo/WishlistSection';
import MySellSection from '../components/myinfo/MySellSection';
import '../styles/MyInfoPage.css'; // 페이지 레이아웃 CSS

// --- 목 데이터 제거 ---
// const mockWishlistData = [...] 제거
// const MOCK_USER_PRODUCT_IDS = [...] 제거

// --- MyInfoPage 컴포넌트 ---
const MyInfoPage = ({ user, handleLogout }) => {
  // --- State 정의 ---
  // wishlistItems, mySellItems, loading state 제거
  const navigate = useNavigate();

  // --- 데이터 로드 로직 제거 ---
  // useEffect(() => { ... }, []); 제거

  // --- 로딩 중 화면 제거 (각 컴포넌트 내부에서 처리) ---
  // if (loading) { ... } 제거

  // --- 로그인 체크 (선택 사항) ---
  useEffect(() => {
    // 실제 앱에서는 user prop을 확인하여 로그인되지 않았으면 리다이렉트
    // if (!user) {
    //   if (window.confirm('로그인이 필요한 서비스입니다...')) {
    //      navigate('/login');
    //   } else {
    //      navigate('/');
    //   }
    // }
  }, [user, navigate]); // user prop이 바뀔 때 체크

  // --- 메인 화면 렌더링 ---
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
          <WishlistSection />

          {/* --- 👇 판매 내역 섹션 컴포넌트 렌더링 --- */}
          <MySellSection />

        </div> {/* my-info-container 끝 */}
      </div> {/* app my-info-page 끝 */}
    </>
  );
};

export default MyInfoPage;