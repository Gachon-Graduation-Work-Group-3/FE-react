import { createContext, useContext, useState, useEffect,useRef, useCallback } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const profileCacheRef = useRef(null);
    const profileFetchedRef = useRef(false);

    // 프로필 정보 가져오기
    const fetchUserProfile = async () => {
        // 이미 인증된 사용자 정보가 캐시되어 있으면 API 호출 스킵
        if (profileCacheRef.current && profileFetchedRef.current) {
            console.log('캐시된 프로필 정보 사용');
            setUser(profileCacheRef.current);
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        if (isLoggingOut) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true); // 로딩 상태 시작
            console.log('프로필 정보 요청 시작');
            
            // 먼저 토큰 갱신 시도
            if(isAuthenticated){
            try {
                const refreshResponse = await fetch(`https://rakunko.store/api/token/renew`, {
                    method: 'GET',
                    credentials: 'include'
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
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
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

            const data = await response.json();
            if (data.isSuccess) {
                // 유저 정보를 로컬 스토리지에 저장
                localStorage.setItem('userData', JSON.stringify(data.result));
                setUser(data.result);
                setIsAuthenticated(true);
                // 프로필 정보 캐싱
                profileCacheRef.current = data.result;
                profileFetchedRef.current = true;
            } else {
                setUser(null);
                setIsAuthenticated(false);
                profileCacheRef.current = null;
                profileFetchedRef.current = false;
            }

        } catch (err) {
            refreshUserToken();
            console.error('프로필 조회 에러:', err);
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
      const response = await fetch('https://rakunko.store/api/token/renew', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        setIsAuthenticated(false);
        return false;
      }

      setIsAuthenticated(true);
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
            setIsLoggingOut(true);
            const response = await fetch('https://rakunko.store/logout', {
                method: 'POST',
                credentials: 'include',
            });

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

    return context;
}; 

