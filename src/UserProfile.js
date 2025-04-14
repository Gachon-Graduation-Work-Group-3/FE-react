import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import './UserProfile.css';
import Header from './components/Header';
function UserProfile() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const { logout } = useContext(UserContext);
    // useUser를 사용하여 사용자 정보 가져오기
    const isAuthenticated = localStorage.getItem('isAuthenticated');    
    const user = localStorage.getItem('userData');
    const [profile,setProfile] = useState(null);
    const [headerState, setHeaderState] = useState({
        theme: 'light',
        isScrolled: false
      });
    const navigate = useNavigate();

    useEffect(() => {
        // 이메일이 비어있으면 API 호출하지 않음
        

        const fetchUserProfile = async () => {
            const contextUser = JSON.parse(localStorage.getItem('userData'));
            console.log(contextUser)
            if (!contextUser) {
                setError('사용자 정보를 찾을 수 없습니다.');
                setLoading(false);
                return;
            }
            const email = contextUser.email;
            console.log(email)
            try {
                console.log("사용할 이메일:", email);
                const response = await fetch('https://rakunko.store/api/user/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Email': email
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('프로필 정보를 불러오는데 실패했습니다.');
                }
                
                const data = await response.json();
                console.log(data)
                if (data.isSuccess) {
                    const userData = {
                        ...data.result,
                        email: email  // 이메일 정보 추가
                    };
                    setProfile(userData);
                } else {
                    throw new Error(data.message || '프로필 정보를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!profile) return <div className="error">사용자 정보를 찾을 수 없습니다.</div>;

    return (
        <div>
            <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />

            <div className="profile-container">
                <h1 className="profile-title">사용자 정보</h1>
                
                <div className="profile-section">
                    <div className="profile-image">
                        <img src={profile.picture} alt="프로필" />
                    </div>
                    
                    <div className="profile-details">
                        <div className="info-group">
                            <label>이름</label>
                            <div className="info-text">{profile.name}</div>
                        </div>

                        <div className="info-group">
                            <label>이메일</label>
                            <div className="info-text">{profile.email}</div>
                        </div>

                        <div className="info-group">
                            <label>역할</label>
                            <div className="info-text">{profile.role}</div>
                        </div>

                        <div className="info-group">
                            <label>사용자 ID</label>
                            <div className="info-text">{profile.userId}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile; 