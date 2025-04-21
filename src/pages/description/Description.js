import React,{memo, useCallback, useState,useEffect,useRef, useContext} from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {fetchCarDescription} from '../../remote/SearchCarDescription';
import ChatWidget from '../../components/ChatWidget';
import './PriceResultPage.css';
import './Description.css';
import { UserContext } from '../../context/UserContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { fetchCarPrediction } from '../../remote/SearchCarprediction';
import Header from '../../components/Header';







function Description() {
  const navigate = useNavigate();
  const location = useLocation();
  const { carId } = location.state || {};
  const [headerState, setHeaderState] = useState({
    theme: 'light',
    isScrolled: false
  });
  
  // 1. 초기 상태에 기본값 설정
  const [carData, setCarData] = useState({
    result: {
      car: {
        carId: '',
        name: '',
        price: 0,
        mileage: 0,
        color: '',
        brand: '',
        description: '',
        age: '2024-01-01',
        cc: 0,
        fuelEff: 0,
        maxOut: 0,
        view: 0,
        newPrice: 0,
        fuel: '',
        transmission: '',
        number: '',
        manufacturer: '',
        image: ''
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(0,);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const { logout } = useContext(UserContext);

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('userData');
  const [isLiked, setIsLiked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allLoading, setAllLoading] = useState(null);
  const componentMountCount = useRef(0);
  useEffect(() => {
    // 마운트 카운트 증가
    componentMountCount.current += 1;
    console.log(`description 마운트 횟수: ${componentMountCount.current}`);
    console.log('인스턴스 ID:', Math.random());
    
    
    // 컴포넌트 언마운트 시 정리
    return () => {
        console.log('ChatWidget 언마운트');
    };
}, []);

  // ChatWidget props를 저장할 상태
  const [chatWidgetProps, setChatWidgetProps] = useState(null);
  
   // carData 로딩 완료 후 한 번만 ChatWidget props 설정
  //  useEffect(() => {
  //   console.log("chatwidgetProps")
  //   if (!loading && carData.result?.car && !chatWidgetProps && allLoading && !chatWidgetInitialized) {
  //     setChatWidgetProps({
  //       initialMessage: `${carData.result.car.name || '차량'} 관련 문의사항이 있으신가요?`,
  //       otherUserId: "temp",
  //       source: carData.result.car.source,
  //       carId: carId
  //     });
  //     setChatWidgetInitialized(true);
  //   }
  // }, [loading, carData, carId, allLoading]);
  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      // 로그인 안 된 경우 로그인 페이지로 이동
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    try {
      // 좋아요 상태 토글
      const newLikeState = !isLiked;
      setIsLiked(newLikeState);
      
      // API 호출 (필요한 경우)
      const response = await fetch(`https://rakunko.store/api/user/like?carId=${carId}}`, {
        method: newLikeState ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // 에러 발생 시 상태 원복
        setIsLiked(!newLikeState);
        throw new Error('좋아요 처리 중 오류가 발생했습니다.');
      }else{
        console.log("좋아요 추가완료")
      }
      
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };
  useEffect(() => {
    if (loading) {
      console.log('초기 cardata 설정');
      setChatWidgetProps({
        initialMessage: `${carData.result?.car?.name || '차량'} 관련 문의사항이 있으신가요?`,
        otherUserId: "temp",
        source: carData.result?.car?.source,
        carId: carId
      });
    }
  }, [loading]);

  useEffect(() => {
    console.log("Description useEffect - carId:", carId);  // 디버깅
    if (!carId) {
      setError('유효하지 않은 차량 ID입니다.');
      setLoading(false);
      return;
    }

    const initializeChat = async () =>{
      try{
        setLoading(true);
        const carResponse = await fetchCarDescription(carId, setCarData, setError, setLoading);
            // carData가 설정된 후에 allLoading 설정
        setTimeout(() => {
          if(carResponse) {
            console.log('carResponse가 존재함, allLoading을 true로 설정');
            setAllLoading(true);
          }
        }, 0);
        if(carData){
          if (carData?.result?.car) {
            const predictionRequestData = {
              age: carData.result.car.age,
              mileage: carData.result.car.mileage,
              cc: carData.result.car.cc,
              fuel_eff: carData.result.car.fuelEff,
              high_out: carData.result.car.maxOut,
              date: new Date().toISOString(),
              view: carData.result.car.view,
              new_price: carData.result.car.newPrice,
              brand: carData.result.car.brand
            };
      
            fetchCarPrediction(
              predictionRequestData,
              setPredictionData,
              setPredictionError,
              setPredictionLoading
            );
            
          }
        }
        
        
    }
    catch(error){
      console.error('데이터 로딩 오류:', error);
      setLoading(false);
    }
  };
    initializeChat();
  }, [carId]);

  // if (loading) return <div>로딩 중...</div>;
  // if (error) return <div>에러: {error}</div>;
  // if (!carData) return <div>차량 정보를 찾을 수 없습니다.</div>;

  // 샘플 시세 데이터
  const priceData = [
    { month: '2023.06', price: 3200 },
    { month: '2023.07', price: 3150 },
    { month: '2023.08', price: 3000 },
    { month: '2023.09', price: 2900 },
    { month: '2023.10', price: 2850 },
    { month: '2023.11', price: 2780 },
    { month: '2023.12', price: 2600 }
  ];
  
  // 시세 통계 데이터
  const statistics = {
    averagePrice: "3,100만원",
    maxPrice: "3,200만원",
    minPrice: "3,000만원",
    priceRange: "200만원",
    totalListings: 156
  };

    return (
      <div className="container">
        <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />

        <div className="result-content">
          <div className="search-summary">
            <h1>차량 상세 정보</h1>
          </div>

          <div className="detail-content">
            <div className="car-header">
              <h1>{carData.result?.car?.name || '차량명 없음'}</h1>
            </div>

            <div className="car-main-info">
              <div className="car-image-section">
                <div className="main-image-container">
                  <img 
                    src={carData.result?.car?.image} 
                    alt={carData.result?.car?.name} 
                    className="car-image"
                  />
                  <button 
                  className={`like-button ${isLiked ? 'active' : ''}`}
                  onClick={handleLikeClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="car-info-section">

                <div className="specs-table">
                <div className="spec-price">
                  <div className="price-card prediction">
                    <h1>예측가격</h1>
                    <h2 className={
                      parseInt(predictionData.predicted_price) > parseInt(carData.result?.car?.price) 
                        ? "price-higher" 
                        : "price-lower"
                    }>
                      {parseInt(predictionData.predicted_price)}만원
                    </h2>
                    {carData.result?.car?.price && (
                      <div className={`price-difference ${
                        parseInt(predictionData.predicted_price) > parseInt(carData.result?.car?.price) 
                          ? "difference-positive" 
                          : "difference-negative"
                      }`}>
                        {(() => {
                          const predictedPrice = parseInt(predictionData.predicted_price);
                          const actualPrice = parseInt(carData.result?.car?.price);
                          const difference = predictedPrice - actualPrice;
                          const percentDiff = ((difference / actualPrice) * 100).toFixed(1);
                          
                          return (
                            <div className="difference-info">
                              <span className="difference-amount">
                                {difference > 0 ? '+' : ''}{difference}만원
                              </span>
                              <span className="difference-percent">
                                {difference > 0 ? '+' : ''}{percentDiff}%
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="price-card actual">
                    <h1>실제가격</h1>
                    <h2>{carData.result?.car?.price}만원</h2>
                  </div>
                </div>
                  <div className="spec-row">
                    <div className="spec-cell">
                      <div className="spec-label">연식</div>
                      <div className="spec-value">
                        {carData.result?.car?.age ? carData.result.car.age.slice(0, 10) : '-'}
                      </div>
                    </div>
                    <div className="spec-cell">
                      <div className="spec-label">주행거리</div>
                      <div className="spec-value">{carData.result?.car?.mileage}km</div>
                    </div>
                  </div>
                  <div className="spec-row">
                    <div className="spec-cell">
                      <div className="spec-label">연료</div>
                      <div className="spec-value">{carData.result?.car?.fuel}</div>
                    </div>
                    <div className="spec-cell">
                      <div className="spec-label">배기량</div>
                      <div className="spec-value">{carData.result?.car?.cc}</div>
                    </div>
                  </div>
                  {/* 추가 스펙 정보... */}
                </div>
              </div>
            </div>

            <div className="car-details-grid">
              {carData.result?.car && Object.entries({
                "연식": carData.result.car.age.slice(0, 10),
                "주행거리": `${carData.result.car.mileage}km`,
                "연료": carData.result.car.fuel,
                "배기량": carData.result.car.cc,
                "색상": carData.result.car.color,
                "변속기": carData.result.car.transmission,
                "차량번호": carData.result.car.number,
                "제조사": carData.result.car.manufacturer
              }).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <label>{key}</label>
                  <span>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
          

          <div className="result-grid">
            <div className="price-chart-section">
              <h2>감가 예상 시세</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#007bff" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="price-stats-section">
              <h2>시세 통계</h2>
              <div className="stats-grid">
                {predictionLoading ? (
                  <div>예측 중...</div>
                ) : predictionError ? (
                  <div>예측 오류: {predictionError}</div>
                ) : predictionData ? (
                  <>
                    <div className="stat-item">
                      <label>예측 가격</label>
                      <value>{parseInt(predictionData.predicted_price)}만원</value>
                    </div>
                    <div className="stat-item">
                      <label>평균 시세</label>
                      <value>{statistics.averagePrice}</value>
                    </div>
                    <div className="stat-item">
                      <label>최고가</label>
                      <value>{statistics.maxPrice}</value>
                    </div>
                    <div className="stat-item">
                      <label>최저가</label>
                      <value>{statistics.minPrice}</value>
                    </div>
                    <div className="stat-item">
                      <label>시세 범위</label>
                      <value>{statistics.priceRange}</value>
                    </div>
                    <div className="stat-item">
                      <label>매물 수</label>
                      <value>{statistics.totalListings}대</value>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="similar-cars-section">
              <h2>유사 매물</h2>
              <div className="similar-cars-grid">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="car-item">
                    <div className="car-image-placeholder"></div>
                    <div className="car-details">
                      <h3>제네시스 G70 2.0T</h3>
                      <p>2021년 | 30,000km</p>
                      <p className="price">3,100만원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    
          {chatWidgetProps ? (
            <>
              {/* {console.log('ChatWidget 렌더링 직전 props:', chatWidgetProps)} */}
              <ChatWidget 
                key="fixed-chat-widget" 
                {...chatWidgetProps} 
              />
            </>
          ) : (
            <div style={{display: 'none'}}>chatWidgetProps가 없음</div>
          )}

        <Link to="/price-search" className="back-button">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}

export default Description;
