import React, { forwardRef, useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { UserContext } from '../context/UserContext';
// forwardRef를 사용하여 ref를 전달받을 수 있게 함
const Header = ({ theme = 'light', isScrolled = false }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const { logout } = useContext(UserContext);
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = JSON.parse(localStorage.getItem('userData'));
    
    // 디버깅을 위한 로그 추가
    // useEffect(() => {
    //     console.log('Header - 인증 상태:', isAuthenticated);
    //     console.log('Header - 인증 타입:', typeof isAuthenticated);
    //     console.log('Header - localStorage 인증 상태:', localStorage.getItem('isAuthenticated'));
    //     console.log('Header - 유저 정보:', user);
    // }, [isAuthenticated, user]);
    
  const handleLogout = async () => {
    try {
      console.log('로그아웃 시도...');
      await logout();
      console.log('로그아웃 성공!');
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
    <div className='outer-nav-bar'>
    <nav className={headerClasses}>
        <div className="logo-container">
        <Link to="/" className={`logo ${theme}`}>얼마일카</Link>
        </div>
        <div className="menu-items">
          <div className="menu-item-container"onClick={()=> navigate('/Selling')}>
          <Link className={`menu-item ${theme}`}>내차 팔기</Link>
          </div>
          <div className="menu-item-container"onClick={()=> navigate('/Buying')}>
          <Link  className={`menu-item ${theme}`}>중고차 정보</Link>
          </div>
          <div className="menu-item-container"onClick={()=> navigate('/sale-buying')}>
          <Link  className={`menu-item ${theme}`}>사용자 판매</Link>
          </div>
        </div>
        <div className="icon-container">
          
          <div className="user-icon">
          {isAuthenticated == 'true' ? (
              <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="welcome-text-container">
                  <span className={`welcome-text ${theme}`}>{user && user.name ? user.name : ''}님</span>
                  </div>
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
                ) : (   
                  <button 
                  onClick={() => {
                    console.log('로그인 버튼 클릭');
                    navigate('/login');
                  }} 
                  className={`login ${theme}`}
                >
                  로그인
                </button>            
            )}
        </div>
        </div>
        </nav>
        </div>
  );
};

export default Header; 