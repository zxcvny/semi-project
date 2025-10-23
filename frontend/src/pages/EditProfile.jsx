import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MdHome } from "react-icons/md";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import "../styles/EditProfile.css";

// 반복되는 입력 필드 컴포넌트
const ProfileInputField = ({ id, label, icon, error, children, ...props }) => (
  <div className="profile-input-group">
    <label htmlFor={id}>{label}</label>
    <div className={`profile-input-wrapper ${error ? 'has-error' : ''}`}>
      {icon && <span className="profile-icon">{icon}</span>}
      <input id={id} {...props} />
      {children}
    </div>
    {error && <p className="profile-error-message">{error}</p>}
  </div>
);

const EditUserPage = ({ user, handleUpdate }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const togglePassword = () => setIsPasswordVisible(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, nickname, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.detail || "회원정보 수정에 실패했습니다." });
        return;
      }

      handleUpdate(data);
      alert("회원정보가 수정되었습니다.");
      navigate('/');
    } catch (err) {
      setErrors({ form: "서버와 통신 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-profile">
      <div className="profile-wrapper">
        <div className="profile-back-link">
          <button onClick={() => navigate('/')} className="profile-back-btn">
            <MdHome className="profile-back-icon"/>메인 페이지로 가기
          </button>
        </div>

        <div className="profile-container">
          <div className="profile-header">
            <h1>회원정보 수정</h1>
            <p>계정 정보를 업데이트하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {/* 이메일 */}
            <ProfileInputField
              id="email"
              label="이메일"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              icon={<FaEnvelope />}
              error={errors.email}
              required
            />
            {/* 닉네임 */}
            <ProfileInputField
              id="nickname"
              label="닉네임"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임"
              error={errors.nickname}
            />
            {/* 비밀번호 */}
            <ProfileInputField
              id="password"
              label="비밀번호"
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="변경할 비밀번호"
              icon={<FaLock />}
              error={errors.password}
            >
              <button
                type="button"
                onClick={togglePassword}
                className="profile-password-toggle-btn"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </ProfileInputField>

            {errors.form && <p className="profile-error-message">{errors.form}</p>}

            <button type="submit" className="profile-btn" disabled={loading}>
              {loading ? '수정 중...' : '정보 수정'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUserPage;