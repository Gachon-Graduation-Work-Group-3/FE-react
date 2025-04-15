import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    // URL에서 토큰 감지하여 처리
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken) {
            console.log('로그인 성공: 토큰을 받았습니다.');
            localStorage.setItem('token', accessToken);
            localStorage.setItem('isAuthenticated', true);
            localStorage.setItem('timestamp', Date.now());
            console.log('accessToken', accessToken);
            console.log('refreshToken', refreshToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            
            // 토큰 정보가 있는 URL을 깨끗하게 정리
            const cleanUrl = location.pathname;
            navigate(cleanUrl, { replace: true });
            
            // 프로필 정보 로드
            fetchUserProfile();
        }
    }, [location, navigate]);


    useEffect(() => {
        console.log('accessToken', localStorage.getItem('token'));
        console.log('refreshToken', localStorage.getItem('refreshToken'));
    }); 

    // 프로필 정보 가져오기
    const fetchUserProfile = async () => {
        

        if (isLoggingOut) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true); // 로딩 상태 시작
            console.log('프로필 정보 요청 시작');
            
            // 저장된 토큰 또는 기본 토큰 사용
            const token = localStorage.getItem('token');
            

            // 갱신 시도 후 프로필 정보 요청
            const response = await api.get('/api/user/profile');

            console.log('API 응답 상태:', response.status);
            console.log('프로필 정보 요청 성공');
            const data = response.data;
            // 응답 데이터 구조 확인을 위한 로그 추가
            console.log('API 응답 데이터:', data);
            
            // 응답 코드로 성공 여부 확인 (COMMON200)
            if (data && data.code === "COMMON200" && data.result) {
                console.log('데이터 조회 성공 - COMMON200');
                // 유저 정보를 로컬 스토리지에 저장
                localStorage.setItem('userData', JSON.stringify(data.result));
                console.log('token', token);
                setUser(data.result);
                
            } else {
                console.log('유효한 데이터 없음 또는 코드가 COMMON200이 아님:', data?.code);
                setUser(null);
            }

        } catch (err) {
            console.error('프로필 조회 에러:', err);
            setError(err.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    // 토큰 갱신 함수
    const refreshUserToken = useCallback(async () => {
        try {
                console.log("401에러 후 refreshUserToken 호출");
                localStorage.setItem('isAuthenticated', true);
                setIsAuthenticated(true);
                localStorage.setItem('token', localStorage.getItem('refreshToken'));
            return true;
        } catch (error) {
                console.error('토큰 갱신 실패:', error);
                setIsAuthenticated(false);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            setIsLoggingOut(true);
            
            // 로컬 상태 초기화를 먼저 수행
            localStorage.removeItem('token');          // 토큰 제거
            localStorage.removeItem('refreshToken');   // 리프레시 토큰 제거
            localStorage.removeItem('userData');       // 유저 데이터 제거
            localStorage.setItem('isAuthenticated', 'false');
            
            setUser(null);
            setIsAuthenticated(false);

    
            // 서버 로그아웃 요청은 마지막에 수행
            await api.post('/logout');
    
            // 로그인 페이지로 리다이렉트
            navigate('/login', { replace: true });
            
        } catch (error) {
            console.error('로그아웃 에러:', error);
            // 에러가 발생해도 로컬 상태는 초기화된 상태 유지
        } finally {
            setIsLoggingOut(false);
        }
    }, []);

    // 컴포넌트 마운트 시 한 번만 실행
    useEffect(() => {
        console.log('userContext 마운트');

        const timestamp = localStorage.getItem('timestamp');
        console.log('timestamp', timestamp);
        console.log('Date.now()', Date.now());
        if (timestamp) {
            const currentTime = Date.now();
            const timeDiff = currentTime - timestamp;
            if (timeDiff > 1000 * 60 * 60 ) {
                logout();
            }
        }
    }, []);

    // 개선: 상태 관리 함수로 일원화
    const setAuthState = (isAuth, userData = null, isLoading = false) => {
        // React 상태 업데이트
        setIsAuthenticated(isAuth);
        if (userData !== null) setUser(userData);
        setLoading(isLoading);
        
        // localStorage 업데이트
        localStorage.setItem('isAuthenticated', isAuth);
        
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else if (userData === null && !isAuth) {
            localStorage.removeItem('userData');
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser,
            loading,
            error,
            isAuthenticated,
            isLoggingOut,
            setIsAuthenticated,
            refetchUser: fetchUserProfile,
            logout,
            refreshUserToken // 토큰 갱신 함수 추가
        }}>
            {children}
        </UserContext.Provider>
    );
}




