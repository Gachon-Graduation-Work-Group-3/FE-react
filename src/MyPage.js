import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
    const { user, isAuthenticated, loading, logout } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        age: '',
        phone: '',
        address: '',
        gender: ''
    });
    const [error, setError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setEditedUser({
                age: user.age || '',
                phone: user.phone || '',
                address: user.address || '',
                gender: user.gender || ''
            });
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setUpdateSuccess(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedUser({
            age: user.age || '',
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || ''
        });
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://rakunko.store/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(editedUser)
            });

            if (!response.ok) {
                throw new Error('회원 정보 수정에 실패했습니다.');
            }

            const data = await response.json();
            if (data.isSuccess) {
                setIsEditing(false);
                setUpdateSuccess(true);
                window.location.reload();
            } else {
                throw new Error(data.message || '회원 정보 수정에 실패했습니다.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (!isAuthenticated) return <div className="error">로그인이 필요합니다.</div>;

    return (
        <div>
            <nav className="nav-bar" >
        <div className="nav-bar-container">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item">내차 팔기</Link>
          <Link to="/Buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="user-icon">
          {isAuthenticated ? (
              <div className="user-menu-container">
                <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="welcome-text">{user.name}님</span>
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
                ) : (
              <div className="main-user-icon">
                <Link to="/login" className="main-login">로그인</Link>
              </div>
            )}
        </div>
        </div>
      </nav>

            <div className="mypage-container">
                <h1 className="mypage-title">내 정보</h1>
                
                {error && <div className="error-message">{error}</div>}
                {updateSuccess && <div className="success-message">회원 정보가 성공적으로 수정되었습니다.</div>}
                
                <div className="profile-section">
                    <div className="profile-image">
                        <img src={user.picture} alt="프로필" />
                    </div>
                    
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>이름</label>
                            <div className="info-text">{user.name}</div>
                        </div>

                        <div className="form-group">
                            <label>이메일</label>
                            <div className="info-text">{user.email}</div>
                        </div>

                        <div className="form-group">
                            <label>나이</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="age"
                                    value={editedUser.age}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="1"
                                    max="120"
                                />
                            ) : (
                                <div className="info-text">{user.age || '미입력'}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>전화번호</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editedUser.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="010-0000-0000"
                                />
                            ) : (
                                <div className="info-text">{user.phone || '미입력'}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>주소</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={editedUser.address}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-text">{user.address || '미입력'}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>성별</label>
                            {isEditing ? (
                                <select
                                    name="gender"
                                    value={editedUser.gender}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">선택하세요</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                </select>
                            ) : (
                                <div className="info-text">
                                    {user.gender === 'male' ? '남성' : 
                                     user.gender === 'female' ? '여성' : '미입력'}
                                </div>
                            )}
                        </div>

                        <div className="button-group">
                            {isEditing ? (
                                <>
                                    <button type="submit" className="save-button">저장</button>
                                    <button type="button" className="cancel-button" onClick={handleCancel}>
                                        취소
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="edit-button" onClick={handleEdit}>
                                    수정
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MyPage; 