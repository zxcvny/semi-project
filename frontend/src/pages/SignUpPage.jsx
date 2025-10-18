import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa6";
import { PiHandHeartFill } from "react-icons/pi";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";

import "../styles/SignUpPage.css"

// 반복되는 입력 필드 컴포넌트 분리, 로그인 필드 사용
const InputField = ({id, label, icon, children, ...props}) => (
  <div className="login-input-group">
    <label htmlFor={id}>{label}</label>
    <div className="login-input-wrapper">
      {icon}
      <input id={id} {...props} />
      {children}
    </div>
  </div>
);

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickName] = useState('');
    const [loading, setLoading] = useState(false);

    const togglePassword = () => {
        setIsPasswordVisible((prev) => !prev)
    }

    const toggleConfirmPassword = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    }

    const navigate = useNavigate();
    return (
        <div className="app-signup">
            <div className="signup-wrapper">
                <div className="back-link">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <FaArrowLeft className="back-icon"/>뒤로가기
                    </button>
                </div>
                <div className="signup-container">
                    <div className="signup-header">
                        <Link to="/" className="link-to"><PiHandHeartFill className="logo-icon" /></Link>
                        <h1>회원가입</h1>
                        <p>내놔요에서 안전한 거래를 시작하세요</p>
                    </div>
                    <form onSubmit={handleSubmit} className="signup-form">
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
                        {/* 비밀번호 확인 입력 필드 */}
                        <InputField
                            id="confirm-password"
                            label="비밀번호 확인"
                            type={isConfirmPasswordVisible ? 'text':'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            icon={<FaLock className="password-icon"/>}
                            required
                        >
                            <button
                            type="button"
                            onClick={toggleConfirmPassword}
                            className="password-toggle-btn"
                            >
                            {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </InputField>
                        {/* 닉네임 입력 필드 */}
                        <InputField
                            id="nickname"
                            label="닉네임"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickName(e.target.value)}
                            placeholder="사용하실 닉네임을 입력해주세요"
                            icon={<GoPerson className="email-icon" />}
                            required
                        />
                        {/* 이용약관 */}
                        <div className="terms-option">
                            <label className="terms-label">
                                <input type="checkbox" required />
                                <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                            </label>
                        </div>
                        {/* 회원가입 버튼 */}
                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? '가입 중...' : '회원가입'}
                        </button>
                    </form>
                    {/* 또는 카카오 로그인, 구글 로그인 */}
                    <div className="divider">
                        <span>또는</span>
                    </div>
                    <div className="social-login">
                    <button className="social-btn kakao">
                        <RiKakaoTalkFill className="social-btn-icon" /> 카카오계정으로 시작하기
                    </button>
                    <button className="social-btn google">
                        <FcGoogle className="social-btn-icon" /> 구글로 시작하기
                    </button>
                    </div>
                    {/* 회원가입 이동 */}
                    <div className="login-link">
                    <p>이미 계정이 있으신가요?</p>
                    <Link to="/login" className="link-to login-link-to">로그인</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUpPage;