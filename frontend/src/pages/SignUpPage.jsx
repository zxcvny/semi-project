import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { MdHome } from "react-icons/md";
import { PiHandHeartFill } from "react-icons/pi";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";

import "../styles/SignUpPage.css"

// 반복되는 입력 필드 컴포넌트 분리, 로그인 필드 사용
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

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const togglePassword = () => {
        setIsPasswordVisible((prev) => !prev)
    }

    const toggleConfirmPassword = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (password.length < 6) {
            setErrors(prev => ({ ...prev, password: "비밀번호는 6자 이상이어야 합니다." }));
            return;
        }

        if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, nickname })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.detail.includes("이메일")) {
                    setErrors(prev => ({ ...prev, email: errorData.detail }));
                } else if (errorData.detail.includes("닉네임")) {
                    setErrors(prev => ({ ...prev, nickname: errorData.detail }));
                } else {
                    setErrors(prev => ({ ...prev, form: errorData.detail || '회원가입에 실패했습니다.' }));
                }
                return;
            }

            alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            setErrors({ form: "서버와 통신 중 오류가 발생했습니다." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-signup">
            <div className="signup-wrapper">
                <div className="back-link">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <MdHome className="back-icon"/>메인 페이지로 가기
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
                            error={errors.email}
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
                            error={errors.password}
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
                            error={errors.confirmPassword}
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
                            error={errors.nickname}
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