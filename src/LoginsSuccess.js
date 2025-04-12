import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import './LoginSuccess.css';  // CSS 파일 생성 필요

function LoginSuccess() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  
  useEffect(() => {
    // isAuthenticated가 true가 되면 메인 페이지로 이동
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
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