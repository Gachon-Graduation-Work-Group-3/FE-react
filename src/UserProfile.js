import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import './UserProfile.css';

function UserProfile() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    // useUser를 사용하여 사용자 정보 가져오기
  
    const [profile,setProfile] = useState(null);

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
            // 로그아웃 API 호출
            const response = await fetch('https://rakunko.store/api/user/logout', {
                method: 'POST',
                credentials: 'include',
            });
            
            if (response.ok) {
                // 로컬 스토리지나 세션에서 토큰 등 제거
                localStorage.removeItem('token');
                navigate('/');
            }
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!profile) return <div className="error">사용자 정보를 찾을 수 없습니다.</div>;

    return (
        <div>
            <nav className="nav-bar">
                <div className="nav-bar-container">
                    <Link to="/" className="logo">얼마일카</Link>
                    <div className="menu-items">
                        <Link to="/search" className="menu-item">모델 검색</Link>
                        <Link to="/Selling" className="menu-item">내차 팔기</Link>
                        <Link to="/Buying" className="menu-item">내차 사기</Link>
                        <Link to="/price-search" className="menu-item">시세 검색</Link>
                    </div>
                    <div className="user-icon">
                        <div className="user-menu-container">
                            <div 
                                className="user-menu-trigger"
                                onMouseEnter={() => setShowDropdown(true)}
                                onMouseLeave={() => setShowDropdown(false)}
                            >
                                <span className="welcome-text">{profile.name}님</span>
                                {showDropdown && (
                                    <div className="user-dropdown">
                                        <button 
                                            onClick={() => navigate('/mypage')} 
                                            className="dropdown-item"
                                        >
                                            내 정보
                                        </button>
                                        <button 
                                            onClick={() => navigate('/mypage/like')} 
                                            className="dropdown-item"
                                        >
                                            좋아요
                                        </button>
                                        <button 
                                            onClick={handleLogout} 
                                            className="dropdown-item"
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

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