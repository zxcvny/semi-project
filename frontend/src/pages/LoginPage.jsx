import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MdHome } from "react-icons/md";
import { PiHandHeartFill } from "react-icons/pi";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";

import "../styles/LoginPage.css"

// 반복되는 입력 필드 컴포넌트 분리
const InputField = ({id, label, icon, error, children, ...props}) => (
  <div className="login-input-group">
    <label htmlFor={id}>{label}</label>
    <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
      {icon}
      <input id={id} {...props} />
      {children}
    </div>
    {error && <p className="error-message">{error}</p>}
  </div>
);

const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "로그인에 실패했습니다.";
        if (data.detail) {
          errorMessage = data.detail;
        }
        setErrors(prev => ({ ...prev, form: errorMessage }));
        return;
      }

      handleLogin();
      navigate('/');
      
    } catch (err) {
      setErrors({ form: "서버와 통신 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  const togglePassword = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  return (
    <div className="app-login">
      <div className="login-wrapper">
        <div className="back-link">
          <button onClick={() => navigate('/')} className="back-btn">
              <MdHome className="back-icon"/>메인 페이지로 가기
          </button>
        </div>
        <div className="login-container">
          <div className="login-header">
            <Link to="/" className="link-to"><PiHandHeartFill className="logo-icon" /></Link>
            <h1>로그인</h1>
            <p>내놔요 계정으로 로그인하세요</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            {/* 이메일 입력 필드 */}
            <InputField
              id="email"
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              icon={<FaEnvelope className="email-icon" />}
              required
            />
            {/* 비밀번호 입력 필드 + 비밀번호 표시 버튼 */}
            <InputField
              id="password"
              label="비밀번호"
              type={isPasswordVisible ? 'text':'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              icon={<FaLock className="password-icon"/>}
              required
            >
              <button
                type="button"
                onClick={togglePassword}
                className="password-toggle-btn"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </InputField>
            {/* 로그인 옵션 - 자동로그인, 비번찾기 */}
            <div className="login-option">
              <label className="auto-login-label">
                <input
                  type="checkbox"
                />
                자동로그인
              </label>
              <a href="#" className="find-password-link link-to">비밀번호 찾기</a> {/* 기능 X */}
            </div>
            {errors.form && <p className="error-message">{errors.form}</p>}
            {/* 로그인 버튼 */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          {/* 또는 카카오 로그인, 구글 로그인 */}
          <div className="divider">
            <span>또는</span>
          </div>
          <div className="social-login">
            <button className="social-btn kakao">
              <RiKakaoTalkFill className="social-btn-icon" /> 카카오계정 로그인
            </button>
            <button className="social-btn google">
              <FcGoogle className="social-btn-icon" /> 구글 로그인
            </button>
          </div>
          {/* 회원가입 이동 */}
          <div className="signup-link">
            <p>아직 계정이 없으신가요?</p>
            <Link to="/signup" className="link-to signup-link-to">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;