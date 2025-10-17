import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { PiHandHeartFill } from "react-icons/pi";
import { GoPerson, GoPlus  } from "react-icons/go";
import '../../styles/Header.css'

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <PiHandHeartFill className="logo-icon" />
            <Link to="/" className="link-to"><h1 className="logo-text">내놔요</h1></Link>
          </div>
        </div>
        <div className="header-middle">
          <div className="search-container">
            <CiSearch className="search-icon"/>
            <input type="text" className='search-bar' placeholder='상품을 검색해보세요' />
          </div>
        </div>
        <div className="header-right">
          {/* 기본 */}
          <div className="header-buttons">
            <Link to="/login">
            <button className="nav-button">로그인</button>
            </Link>
            <button className="nav-button signup">회원가입</button>
            <button className="sell-button">+ 판매하기</button>
          </div>
        </div>
        {/* 화면 줄였을 때 */}
        <div className="header-icons">
            <Link to="/login" className="icon-button">
              <GoPerson />
            </Link>
            <button className="icon-button plus-button">
              <GoPlus />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;