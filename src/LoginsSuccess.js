import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import './LoginSuccess.css';  // CSS 파일 생성 필요

function LoginSuccess() {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('userData');
  useEffect(() => {
    // isAuthenticated가 true가 되면 메인 페이지로 이동
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      // 5초 후에도 인증되지 않으면 로그아웃 처리
      const timer = setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 5000);

      return () => clearTimeout(timer);
    }
    
  });
  return (
    <div className="login-success-container">
      <div className="login-success-content">
        <div className="loading-spinner"></div>
        <h1 className="welcome-text">환영합니다!</h1>
        <p className="loading-text">로그인 진행 중...</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccess;