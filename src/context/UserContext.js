import { createContext, useContext, useState, useEffect,useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    const profileCacheRef = useRef(null);
    const profileFetchedRef = useRef(false);
    // URL에서 토큰 감지하여 처리
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken) {
            console.log('로그인 성공: 토큰을 받았습니다.');
            localStorage.setItem('token', accessToken);
            localStorage.setItem('isAuthenticated', true);
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
    
    // 프로필 정보 가져오기
    const fetchUserProfile = async () => {
        localStorage.setItem('isAuthenticated', false);
        // 이미 인증된 사용자 정보가 캐시되어 있으면 API 호출 스킵
        if (profileCacheRef.current && profileFetchedRef.current) {
            console.log('캐시된 프로필 정보 사용');
            setUser(profileCacheRef.current);
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        if (isLoggingOut) {
            localStorage.setItem('isAuthenticated', false);
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
            
            // 먼저 토큰 갱신 시도
            if(isAuthenticated){
            try {
                const refreshResponse = await fetch(`https://rakunko.store/api/token/renew`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (refreshResponse.ok) {
                    console.log('토큰 갱신 성공');
                } else {
                    console.log('토큰 갱신 실패');
                }
            } catch (error) {
                console.error('토큰 갱신 중 에러:', error);
                }
            }

            // 갱신 시도 후 프로필 정보 요청
            const response = await fetch('https://rakunko.store/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API 응답 상태:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('인증 실패');
                    setIsAuthenticated(false);
                    setUser(null);
                    profileCacheRef.current = null;
                    profileFetchedRef.current = false;
                    refreshUserToken();
                    
                }
                throw new Error('프로필 정보를 가져오는데 실패했습니다.');
            }
            console.log('프로필 정보 요청 성공');
            const data = await response.json();
            // 응답 데이터 구조 확인을 위한 로그 추가
            console.log('API 응답 데이터:', data);
            
            // 응답 코드로 성공 여부 확인 (COMMON200)
            if (data && data.code === "COMMON200" && data.result) {
                console.log('데이터 조회 성공 - COMMON200');
                // 유저 정보를 로컬 스토리지에 저장
                localStorage.setItem('token', token);
                localStorage.setItem('userData', JSON.stringify(data.result));
                localStorage.setItem('isAuthenticated', true);
                setUser(data.result);
                setIsAuthenticated(true);
                // 프로필 정보 캐싱
                profileCacheRef.current = data.result;
                profileFetchedRef.current = true;
            } else {
                console.log('유효한 데이터 없음 또는 코드가 COMMON200이 아님:', data?.code);
                setUser(null);
                setIsAuthenticated(false);
                profileCacheRef.current = null;
                profileFetchedRef.current = false;
            }

        } catch (err) {
            refreshUserToken();
            console.error('프로필 조회 에러:', err);
            localStorage.setItem('isAuthenticated', false);
            setError(err.message);
            setIsAuthenticated(false);
            setUser(null);
            profileCacheRef.current = null;
            profileFetchedRef.current = false;
        } finally {
            setLoading(false);
        }
    };
    // 토큰 갱신 함수
  const refreshUserToken = useCallback(async () => {
    try {
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

    // 컴포넌트 마운트 시 한 번만 실행
    useEffect(() => {
        if (!isAuthenticated && !isLoggingOut && !profileFetchedRef.current) {
            fetchUserProfile();
        }
    }, [isAuthenticated, isLoggingOut]);

    // 컨텍스트 값 업데이트 함수
    const updateUser = (newUserData) => {
        setUser(newUserData);
        // 캐시도 업데이트
        profileCacheRef.current = newUserData;
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            setIsLoggingOut(true);
            const response = await fetch('https://rakunko.store/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            localStorage.setItem('isAuthenticated', false);
            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);

                // 캐시 초기화
                profileCacheRef.current = null;
                profileFetchedRef.current = false;

            } else {
                throw new Error('로그아웃 실패');
            }
        } catch (error) {
            console.error('로그아웃 에러:', error);
            throw error;
        }
    };
    // 캐시된 사용자 정보 강제 갱신 함수 추가
    const forceRefreshUser = () => {
        profileFetchedRef.current = false;
        fetchUserProfile();
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
            forceRefreshUser, // 강제 갱신 함수 추가
            logout,
            refreshUserToken // 토큰 갱신 함수 추가
        }}>
            {children}
        </UserContext.Provider>
    );
}


// 커스텀 훅 수정
export const useUser = () => {  
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }

    // useEffect를 사용하여 훅이 호출될 때마다 인증 상태 초기화 및 재확인
    useEffect(() => {
        // 초기 호출 시 localStorage의 인증 상태를 false로 설정
        localStorage.setItem('isAuthenticated', false);
        console.log('useUser 훅 호출: 초기 인증 상태를 false로 설정');
        
        // 컴포넌트 마운트 후 프로필 정보 가져오기
        if (context.refetchUser) {
            context.refetchUser();
        }
    }, []);

    return context;
}; 

