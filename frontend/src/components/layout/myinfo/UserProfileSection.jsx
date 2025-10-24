import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/UserProfileSection.css'; // 새 CSS 파일 import

const UserProfileSection = ({ user, setUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 추가

    const navigate = useNavigate();

    // user prop이 변경되면 nickname 상태 업데이트
    useEffect(() => {
        setNickname(user?.nickname || '');
    }, [user]);

    const handleEditToggle = () => {
        if (isEditing) {
            // 수정 완료 (확인) 버튼 클릭 시
            // 변경 사항이 있는지 확인
            const nicknameChanged = nickname !== user.nickname;
            const passwordChanged = password !== '';

            if (nicknameChanged || passwordChanged) {
                if (window.confirm('수정하시겠습니까?')) {
                    handleUpdateProfile();
                } else {
                    // 취소 시 원래 정보로 복구 및 수정 모드 종료
                    setNickname(user.nickname);
                    setPassword('');
                    setConfirmPassword('');
                    setIsEditing(false);
                    setError(null);
                    setSuccessMessage('');
                }
            } else {
                // 변경 사항 없으면 그냥 수정 모드 종료
                setIsEditing(false);
                setError(null);
                setSuccessMessage('');
            }
        } else {
            // 수정 버튼 클릭 시
            setIsEditing(true);
            setPassword(''); // 수정 모드 진입 시 비밀번호 필드 초기화
            setConfirmPassword('');
            setError(null);
            setSuccessMessage('');
        }
    };

    const handleUpdateProfile = async () => {
        setError(null);
        setSuccessMessage('');
        setIsSubmitting(true); // 제출 시작

        // 유효성 검사
        if (nickname.trim() === '') {
            setError('닉네임을 입력해주세요.');
            setIsSubmitting(false);
            return;
        }
        if (password && password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            setIsSubmitting(false);
            return;
        }
        if (password && password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            setIsSubmitting(false);
            return;
        }

        const updateData = {};
        if (nickname !== user.nickname) {
            updateData.nickname = nickname;
        }
        if (password) {
            updateData.password = password;
        }

        // 변경할 데이터가 없으면 API 호출 안 함
        if (Object.keys(updateData).length === 0) {
            setIsEditing(false);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                // 닉네임 중복 에러 처리
                if (response.status === 400 && errorData.detail.includes("닉네임")) {
                     setError(errorData.detail);
                } else {
                    throw new Error(errorData.detail || '정보 수정에 실패했습니다.');
                }
                return; // 에러 발생 시 여기서 중단
            }

            const updatedUser = await response.json();
            setUser(updatedUser); // App.jsx의 user 상태 업데이트 (props로 전달받음)
            setSuccessMessage('성공적으로 수정되었습니다.');
            setIsEditing(false); // 수정 모드 종료
            setPassword(''); // 비밀번호 필드 초기화
            setConfirmPassword('');

        } catch (err) {
            console.error("정보 수정 중 오류:", err);
            setError(err.message || '정보 수정 중 오류가 발생했습니다.');
        } finally {
             setIsSubmitting(false); // 제출 완료
        }
    };

    const handleWithdraw = () => {
        if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            // 실제 탈퇴 API 호출 로직 추가 (백엔드 구현 필요)
            alert('탈퇴 처리되었습니다. (실제 API 연동 필요)');
            // 로그아웃 처리 또는 로그인 페이지로 리디렉션 등
            // handleLogout(); // 필요 시 로그아웃 함수 호출
            // navigate('/');
        }
    };


    return (
        <div className="user-profile-section">
            <h2>{user ? user.nickname : '사용자'}님, 안녕하세요!</h2>

            <div className="profile-info">
                <div className="info-item">
                    <label>이메일</label>
                    <input type="email" value={user?.email || ''} readOnly disabled />
                </div>
                <div className="info-item">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing || isSubmitting} // 제출 중 비활성화
                    />
                </div>

                {/* 수정 모드일 때만 비밀번호 변경 필드 표시 */}
                {isEditing && (
                    <>
                        <div className="info-item">
                            <label htmlFor="password">새 비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="새 비밀번호 (6자 이상)"
                                disabled={isSubmitting} // 제출 중 비활성화
                            />
                        </div>
                        <div className="info-item">
                            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="새 비밀번호 확인"
                                disabled={isSubmitting} // 제출 중 비활성화
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 에러 및 성공 메시지 표시 */}
            {error && <p className="profile-error-message">{error}</p>}
            {successMessage && <p className="profile-success-message">{successMessage}</p>}


            <div className="profile-actions">
                <button onClick={handleEditToggle} className="edit-btn" disabled={isSubmitting}>
                    {isSubmitting ? '처리 중...' : (isEditing ? '확인' : '수정')}
                </button>
                <button onClick={handleWithdraw} className="withdraw-btn" disabled={isEditing || isSubmitting}>
                    탈퇴
                </button>
            </div>
        </div>
    );
};

export default UserProfileSection;