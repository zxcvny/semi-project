import '../../styles/Header.css'
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo">중고장터</h1>
          <input
            type="text"
            className="search-bar"
            placeholder="상품을 검색해보세요"
          />
        </div>
        <div className="header-right">
          <Link to="/login">
          <button className="nav-button">로그인</button>
          </Link>
          <button className="nav-button">회원가입</button>
          <button className="sell-button">+ 판매하기</button>
        </div>
      </div>
    </header>
  );
};
export default Header;