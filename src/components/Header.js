import React, { forwardRef,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Header.css';
// forwardRef를 사용하여 ref를 전달받을 수 있게 함
const Header = ({ theme = 'light', isScrolled = false }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const { isAuthenticated, user, logout } = useUser();
    console.log(theme,isScrolled);
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };
  const headerClasses = [
    'nav-bar',           // 기본 클래스
    theme,               // theme 클래스 ('dark' 또는 'light')
    isScrolled ? 'scrolled' : ''  // 스크롤 상태 클래스
  ].filter(Boolean).join(' ');
  return (
    <nav className={headerClasses}>
       <div className="nav-bar-container">
        <Link to="/" className={`logo ${theme}`}>얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className={`menu-item ${theme}`}>모델 검색</Link>
          <Link to="/Selling" className={`menu-item ${theme}`}>내차 팔기</Link>
          <Link to="/Buying" className={`menu-item ${theme}`}>내차 사기</Link>
          <Link to="/price-search" className={`menu-item ${theme}`}>시세 검색</Link>
        </div>
        <div className="icon-container">
          
          <div className="user-icon">
          {isAuthenticated ? (
              <div className="user-menu-container">
                <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className={`welcome-text ${theme}`}>{user.name}님</span>
                  {showDropdown && (
                    <div className="user-dropdown">
                      
                      <button 
                        onClick={() => navigate('/userProfile')} 
                        className={`dropdown-item ${theme}`}
                      >
                        내 정보
                      </button>
                      <button 
                        onClick={() => navigate('/like')} 
                        className={`dropdown-item ${theme}`}
                      >
                        좋아요
                      </button>
                      <button
                        onClick={()=> navigate('/chat-rooms')}
                        className={`dropdown-item ${theme}`}
                        >
                          채팅방
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className={`dropdown-item ${theme}`}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
                ) : (
              <div className="user-icon">
                <Link to="/login" className={`login ${theme}`}>로그인</Link>
              </div>
            )}
        </div>
        </div>
        </div>
        </nav>
  );
};

export default Header; 