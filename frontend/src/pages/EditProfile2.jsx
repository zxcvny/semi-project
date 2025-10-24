import { useState } from "react";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import "../styles/EditProfile2.css";

// 임시
const mockUser = {
  id: 1,
  email: "example@email.com",
  nickname: "KJY1234",
};

const ProfilePage = () => {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [tempNickname, setTempNickname] = useState(user.nickname);
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePassword = () => setIsPasswordVisible(prev => !prev);

  const handleEditToggle = () => {
    if (editing) {
      setUser({
        ...user,
        email: tempEmail,
        nickname: tempNickname,
      });
      alert("회원정보가 수정되었습니다!");
    }
    setEditing(!editing);
  };

  return (
    <div className="app-profile">
      <div className="profile-container">
        <h1>회원정보</h1>
        <p>이 페이지에서 정보를 확인하고 수정할 수 있습니다.</p>

        <div className="profile-form">
          {/* 이메일 */}
          <div className="profile-input-group">
            <label>이메일</label>
            <div className="profile-input-wrapper">
              <span className="profile-icon"><FaEnvelope /></span>
              <input
                type="email"
                value={tempEmail}
                onChange={e => setTempEmail(e.target.value)}
                disabled={!editing}
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="profile-input-group">
            <label>닉네임</label>
            <div className="profile-input-wrapper">
              <input
                type="text"
                value={tempNickname}
                onChange={e => setTempNickname(e.target.value)}
                placeholder="닉네임"
                disabled={!editing}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="profile-input-group">
            <label>비밀번호</label>
            <div className="profile-input-wrapper">
              <span className="profile-icon"><FaLock /></span>
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호"
                disabled={!editing}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="profile-password-toggle-btn"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button onClick={handleEditToggle} className="profile-btn">
            {editing ? "확인" : "수정"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
