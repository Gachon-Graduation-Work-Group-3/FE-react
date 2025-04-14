import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './context/UserContext';
import { useNavigate } from 'react-router-dom';
import api from './api/axiosInstance';
import './UserContextPage.css';

function UserContextPage() {
  const navigate = useNavigate();
  // 사용자 인증 상태 확인
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const [previewImages, setPreviewImages] = useState([]);
  const [form_Data, setForm_Data] = useState({
    // 다른 필드들...
    images: []  // 반드시 빈 배열로 초기화
  });
  // 결과 및 로딩 상태 관리
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const goToLoginPage = () => {
    navigate('/login');
  };
  // UserContext에서 필요한 함수 가져오기
  const { logout, refreshUserToken } = useContext(UserContext);
  
  // 기본 정보값
  const [formData, setFormData] = useState({
    carId: '1',
    userId: userData?.userId || '',
    email: userData?.email || '',
    token: localStorage.getItem('token') || ''
  });

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 결과 추가 함수
  const addResult = (type, status, data, requestData = null, error = null) => {
    const newResult = {
      id: Date.now(),
      type,
      status,
      requestData: requestData ? (typeof requestData === 'object' ? JSON.stringify(requestData, null, 2) : requestData) : null,
      data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
      error: error ? (typeof error === 'object' ? JSON.stringify(error, null, 2) : error) : null,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [newResult, ...prev]);
  };

  // API 호출 함수들
  // 1. 사용자 프로필 조회
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/profile');
      addResult('프로필 조회', '성공', response.data, { url: '/api/user/profile', method: 'GET' });
    } catch (error) {
      addResult('프로필 조회', '실패', null, { url: '/api/user/profile', method: 'GET' }, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 토큰 갱신 테스트
  const testTokenRenewal = async () => {
    setLoading(true);
    try {
      await refreshUserToken();
      addResult('토큰 갱신', '성공', '토큰이 성공적으로 갱신되었습니다.');
    } catch (error) {
      addResult('토큰 갱신', '실패', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. 로그아웃
  const testLogout = async () => {
    setLoading(true);
    try {
      await logout();
      addResult('로그아웃', '성공', '로그아웃 완료');
    } catch (error) {
      addResult('로그아웃', '실패', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. 차량 정보 조회
  const fetchCarInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://rakunko.store/api/car/search/description?carId=${formData.carId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      addResult('차량 정보 조회', '성공', data);
    } catch (error) {
      addResult('차량 정보 조회', '실패', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. 좋아요 추가
  const addLike = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://rakunko.store/api/user/like?carId=${formData.carId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      addResult('좋아요 추가', '성공', data);
    } catch (error) {
      addResult('좋아요 추가', '실패', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. 좋아요 취소
  const removeLike = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://rakunko.store/api/user/like?carId=${formData.carId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      addResult('좋아요 취소', '성공', data);
    } catch (error) {
      addResult('좋아요 취소', '실패', null, error.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. 가격 예측 테스트
  const testPricePrediction = async () => {
    setLoading(true);
    try {
      const requestData = {
        manufacturer_id: 1,
        model_id: 1,
        sub_model_id: 1,
        grade_id: 1,
        year: 2020,
        mileage: 30000
      };
      
      const response = await api.post('/api/price/prediction', requestData);
      addResult('가격 예측', '성공', response.data);
    } catch (error) {
      addResult('가격 예측', '실패', null, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 8. 토큰 상태 확인
  const checkTokenStatus = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    addResult('토큰 상태', '정보', {
      token: token ? `${token.substring(0, 10)}...` : '없음',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : '없음',
      isAuthenticated: isAuth
    });
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // 이미지 미리보기 생성
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previews]);
    
    // 이미지 파일 저장
    setForm_Data(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };
  // 9. 차량 판매 등록 테스트
  const testsendSellingArticle = async () => {
    setLoading(true);
    try {
    const formDataToSend = new FormData();
      
      // 이미지 파일 추가
      form_Data.images.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      // carSaleRequest JSON 생성 (현재 입력 필드 매핑)
      const carSaleRequest = {
        cc: 0,
        engine: "string",
        color: "wh",
        firstReg: "2025-04-13",
        brand: "string",
        submodel: "string",
        price: 0,
        model: "string",
        number: "12가 1533",
        newPrice: 0,
        mileage: 0,
        torque: 0,
        maxOut: 0,
        name: "string",
        fuelEfficient: 0,
        manufacturer: "string",
        fuel: "string",
        grade: "string",
        weight: 0,
        description: "string",
        age: "2025-04-13",
        images: "string",
      };
      
      formDataToSend.append('carSaleRequest', JSON.stringify(carSaleRequest));

      console.log('=== FormData 전송 데이터 로그 ===');

      // 이미지 파일 로그
      form_Data.images.forEach((file, index) => {
          console.log(`이미지 ${index + 1}:`, {
              파일명: file.name,
              타입: file.type,
              크기: `${(file.size / 1024).toFixed(2)}KB`
          });
      });

      // carSaleRequest 객체 로그
      console.log('차량 정보:', {
          차량번호: carSaleRequest.number,
          제조사: carSaleRequest.manufacturer,
          모델: carSaleRequest.model,
          세부모델: carSaleRequest.submodel,
          등급: carSaleRequest.grade,
          차량명: carSaleRequest.name,
          가격: `${carSaleRequest.price.toLocaleString()}원`,
          주행거리: `${carSaleRequest.mileage.toLocaleString()}km`,
          연식: carSaleRequest.age,
          최초등록일: carSaleRequest.firstReg
      });

      // FormData 전체 내용 로그
      for (const [key, value] of formDataToSend.entries()) {
          if (value instanceof File) {
              console.log(`${key}:`, {
                  타입: 'File',
                  파일명: value.name,
                  파일타입: value.type,
                  파일크기: `${(value.size / 1024).toFixed(2)}KB`
              });
          } else if (value instanceof Blob) {
              console.log(`${key}:`, {
                  타입: 'Blob',
                  데이터: JSON.parse(await value.text())
              });
          } else {
              console.log(`${key}:`, value);
          }
      }

      console.log('=== 전송 데이터 로그 종료 ===');
      // API 요청
      const response = await api.post('api/car/sale/article', formDataToSend);

      
      if (!response.ok) {
        throw new Error('차량 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.isSuccess) {
        console.log('차량 등록 성공');
      } else {
        throw new Error(data.message || '차량 등록에 실패했습니다.');
      }
      
    
  
      
      addResult('차량 판매 등록', '성공', response.data);
    } catch (error) {
      addResult('차량 판매 등록', '실패', null, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
        
        
  return (
    <div className="usercontext-page">
      <div className="usercontext-header">
        <h1>API 테스트 페이지</h1>
        <div className="auth-status">
          인증 상태: {isAuthenticated === 'true' ? '로그인됨' : '로그인되지 않음'}
        </div>
        <button onClick={goToLoginPage} disabled={loading}>
          로그인 페이지로 이동
        </button>
      </div>
      
      <div className="user-info">
        {userData && (
          <div className="user-profile">
            <h2>사용자 정보</h2>
            <pre>{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
      </div>
            <div className="form-container">
        <h3>API 요청 파라미터</h3>
      <div className="input-group">
          <label>차량 ID</label>
          <input
            type="text"
            name="carId"
            value={formData.carId}
            onChange={handleInputChange}
            placeholder="차량 ID"
          />
        </div>
        <div className="input-group">
          <label>사용자 ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            placeholder="사용자 ID"
            disabled
          />
        </div>
        <div className="input-group">
          <label>이메일</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            disabled
          />
        </div>
      </div>

      <div className="api-buttons">
        <h3>API 요청</h3>
        <div className="button-group">
          <h4>사용자 관련</h4>
          <button onClick={fetchProfile} disabled={loading}>
            프로필 정보 조회
          </button>
          <button onClick={testTokenRenewal} disabled={loading}>
            토큰 갱신 테스트
          </button>
          <button onClick={testLogout} disabled={loading}>
            로그아웃 테스트
          </button>
          <button onClick={checkTokenStatus} disabled={loading}>
            토큰 상태 확인
          </button>
        </div>
        
        <div className="button-group">
          <h4>차량 관련</h4>
          <button onClick={fetchCarInfo} disabled={loading}>
            차량 정보 조회
          </button>
          <button onClick={addLike} disabled={loading || isAuthenticated !== 'true'}>
            좋아요 추가
          </button>
          <button onClick={removeLike} disabled={loading || isAuthenticated !== 'true'}>
            좋아요 취소
          </button>
          <button onClick={testPricePrediction} disabled={loading}>
            가격 예측 테스트
          </button>
          <div className="image-upload">
                  <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  클릭하여 사진을 업로드하세요
                </label>
              </div>
              {previewImages.length > 0 && (
                <div className="preview-images">
                  {previewImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                  ))}
                </div>
              )}
          <button onClick={testsendSellingArticle} disabled={loading}>
            차량 판매 등록 테스트
          </button>
        </div>
      </div>

      <div className="results-container">
        <h2>API 요청 결과</h2>
        {results.length === 0 ? (
          <div className="no-results">아직 결과가 없습니다. 버튼을 눌러 API를 테스트해보세요.</div>
        ) : (
          <div className="results-list">
            {results.map(result => (
              <div key={result.id} className={`result-item ${result.status === '성공' ? 'success' : result.status === '정보' ? 'info' : 'error'}`}>
                <div className="result-header">
                  <span className="result-type">{result.type}</span>
                  <span className="result-status">{result.status}</span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
                <div className="result-body">
                  {result.data && (
                    <div className="result-data">
                      <h4>응답 데이터:</h4>
                      <pre>{result.data}</pre>
                    </div>
                  )}
                  {result.error && (
                    <div className="result-error">
                      <h4>에러:</h4>
                      <pre>{result.error}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserContextPage;
