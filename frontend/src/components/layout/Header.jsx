import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { PiHandHeartFill } from "react-icons/pi";
import { GoPerson, GoPlus  } from "react-icons/go";
import '../../styles/Header.css'

const Header = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/'); // 홈으로 이동
      window.location.reload(); // 페이지 새로고침
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        {/* 로고 */}
        <div className="header-left">
          <Link to="/" className="link-to">
            <div className="logo-container">
              <PiHandHeartFill className="logo-icon"/>
              <h1 className="logo-text">내놔요</h1>
            </div>
          </Link>
        </div>
        {/* 검색창 */}
        {/* 검색 결과 표시 창 만들어야 함 */}
        <div className="header-middle">
          <div className="search-container">
            <IoSearchOutline  className="search-icon"/>
            <input
            type="text"
            className="search-input"
            placeholder="찾으시는 상품이 무엇인가요?"
            />
          </div>
        </div>
        {/* 로그인, 회원가입, 판매하기 버튼 */}
        {/* 로그인 상태에 따라 변화해야 함 (로그아웃, 내정보, 판매하기) */}
        {/* 화면 상태에 따라 요소 변화 */}
        <div className="header-right">
          {user ? (
            // 로그인 상태일 때
            <>
              <div className="user-menu-container">
                <div className="nickname-wrapper" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                  <p className="user-nickname"><span>{user.nickname}</span> 님</p>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/myinfo" className="dropdown-item">내 정보</Link>
                      <div onClick={handleLogout} className="dropdown-item logout">로그아웃</div>
                    </div>
                  )}
                </div>
                <Link to="/sell" className="link-to header-sell-btn">+ 판매하기</Link>
              </div>
              <div className="user-menu-media">
                <Link to="/my-info" className="link-to header-login-icon"><GoPerson /></Link>
                <Link to="/sell" className="link-to header-sell-icon"><GoPlus /></Link>
              </div>
            </>
          ) : (
            // 로그아웃 상태일 때
            <>
              {/* 전체 화면 */}
              <div className="btn-container-full">
                <Link to="/login" className="link-to header-login-btn">로그인</Link>
                <Link to="/signup" className="link-to header-signup-btn">회원가입</Link>
                <Link to="/sell" className="link-to header-sell-btn">+ 판매하기</Link>
              </div>
              {/* 화면이 작아질 때 아이콘으로 변경 */}
              <div className="btn-container-media">
                <Link to="/login" className="link-to header-login-icon"><GoPerson /></Link>
                <Link to="/sell" className="link-to header-sell-icon"><GoPlus /></Link>
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;