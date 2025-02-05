import { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 프로필 정보 가져오기
    const fetchUserProfile = async () => {
        try {
            console.log('프로필 정보 요청 시작');
            
            const response = await fetch('https://rakunko.store/api/user/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('API 응답 상태:', response.status);

            if (!response.ok) {
                throw new Error('프로필 정보를 가져오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('받아온 프로필 데이터:', {
                isSuccess: data.isSuccess,
                code: data.code,
                message: data.message,
                result: {
                    userId: data.result.userId,
                    name: data.result.name,
                    email: data.result.email,
                    picture: data.result.picture
                }
            });

            // 인증 상태와 사용자 정보 동시 업데이트
            setIsAuthenticated(data.isSuccess);
            if (data.isSuccess) {
                setUser(data.result);
            } else {
                setUser(null);
            }
            console.log('사용자 정보 업데이트 완료');

        } catch (err) {
            console.error('프로필 조회 에러:', err);
            setError(err.message);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
            console.log('프로필 정보 요청 완료');
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // 컨텍스트 값 업데이트 함수
    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser: updateUser,
            loading,
            error,
            refetchUser: fetchUserProfile,
            isAuthenticated
        }}>
            {children}
        </UserContext.Provider>
    );
}

// 커스텀 훅 생성
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 