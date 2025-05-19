import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rakunko.store'
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  config => {
    // 요청 전에 헤더에 토큰 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터 추가
api.interceptors.response.use(
  response => response, // 응답 성공 시 그대로 반환
  async error => {
    const originalRequest = error.config;
    console.log('error', error);
    // 401 에러이고 재시도한 적이 없으면
    if(error.AxiosError){
      console.log('error.AxiosError');
      window.location.href = '/login';
    }
    else{
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          console.log('리프레시 토큰 요청');
          // 리프레시 토큰으로 새 액세스 토큰 요청
          const refreshToken = localStorage.getItem('refreshToken');
          console.log('refreshToken', refreshToken);
          const response = await fetch(`https://rakunko.store/api/token/renew`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            },
        }); 
        console.log(response);  
          // 새 토큰 저장
          const newToken = response.result.accesstoken;
          const newRefreshToken = response.result.refreshtoken;
        ;
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          setTimeout(() => {
          // 리프레시 토큰도 만료되었으면 로그아웃
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.setItem('isAuthenticated', 'false');
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          }, 100);
          return Promise.reject(refreshError);
        }
      }else{
          // 10초 후 로그아웃 및 리다이렉트
          setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.setItem('isAuthenticated', 'false');
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        }, 100);
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;