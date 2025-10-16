import { useState } from 'react';
import { Link } from "react-router-dom";
import { PiHandHeartFill } from "react-icons/pi";
import '../styles/LoginPage.css';

import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaFacebook,
} from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';

// --- [개선점 1] 입력 필드 컴포넌트 분리 ---
// 반복되는 입력 필드 UI를 별도의 컴포넌트로 만들어 코드를 간결하게 합니다.
const InputField = ({ id, label, icon, children, ...props }) => (
  <div className="input-group">
    <label htmlFor={id}>{label}</label>
    <div className="input-wrapper">
      {icon}
      <input id={id} {...props} />
      {/* 비밀번호 보기/숨기기 버튼 같은 추가적인 요소를 위한 공간 */}
      {children}
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 실제 API 통신을 위한 주석 처리된 예제
      // 실제 애플리케이션에서는 이 URL을 환경 변수 등으로 관리하는 것이 좋습니다.
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, autoLogin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      }

      const userData = await response.json();
      console.log('Login success:', userData);
      // 로그인 성공 후 처리 로직 (예: 메인 페이지로 이동, 사용자 정보 저장 등)
      // window.location.href = '/main';

    } catch (err) {
      // instanceof를 사용하여 더 안전하게 에러 타입을 확인합니다.
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="back-link">
        <Link to="/" className='link-to'><FaArrowLeft /> 뒤로가기</Link>
      </div>

      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="link-to"><PiHandHeartFill className="logo-icon" /></Link>
          <h1>로그인</h1>
          <p>내놔요 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <InputField
            id="email"
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            icon={<FaEnvelope className="input-icon" />}
            required
            aria-invalid={!!errorMsg} // 에러가 있을 때 aria-invalid 속성 추가
          />

          <InputField
            id="password"
            label="비밀번호"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            icon={<FaLock className="input-icon" />}
            required
            aria-invalid={!!errorMsg}
          >
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
              // --- [개선점 2] 접근성 향상 ---
              aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </InputField>

          <div className="options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              자동 로그인
            </label>
            <a href="#" className="find-password-link">
              비밀번호 찾기
            </a>
          </div>

          {/* --- [개선점 2] 접근성 향상 --- */}
          {errorMsg && (
            <div className="error-message" role="alert" aria-live="assertive">
              {errorMsg}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="divider">
          <span>또는</span>
        </div>

        <div className="social-login">
          <button type="button" className="social-btn kakao">
            <RiKakaoTalkFill /> 카카오로 로그인
          </button>
          <button type="button" className="social-btn facebook">
            <FaFacebook /> 페이스북으로 로그인
          </button>
        </div>

        <div className="signup-link">
          아직 계정이 없으신가요? <a href="#">회원가입</a>
        </div>
      </div>

      <button type="button" className="help-btn">?</button>
    </div>
  );
};

export default Login;
