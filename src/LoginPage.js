import React from 'react';
import './LoginPage.css';
import { FcGoogle } from 'react-icons/fc';  // Google 아이콘

function LoginPage() {
    const handleGoogleLogin = () => {
        window.location.href = 'https://rakunko.store/oauth2/authorization/google';
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-header">
                    <h1>Welcome to 얼마일카</h1>
                    <p>중고차 거래의 새로운 경험</p>
                </div>
                
                <button onClick={handleGoogleLogin} className="google-login-btn">
                    <FcGoogle className="google-icon" />
                    <span>Google로 계속하기</span>
                </button>
            </div>
        </div>
    );
}

export default LoginPage;