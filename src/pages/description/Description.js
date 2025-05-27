import React,{useState,useEffect,useRef} from 'react';
import {fetchCarByInfo, fetchCarByModel} from '../../remote/searchcar';
import {formatDateToYearMonth} from '../../util/formatDateToYearMonth';
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
  const { carId, isSale } = location.state || {};
  const [headerState, setHeaderState] = useState({
    theme: 'light',
    isScrolled: false
  });
  
  // 1. 초기 상태에 기본값 설정
  const [carData, setCarData] = useState(isSale ?   {
    result: {
      carSale: {
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
        image: '',
        user:{
          id:'',
        }
      }
    }
  } : {
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
  const [modelStatistics, setModelStatistics] = useState({
    averagePrice: "0만원",
    maxPrice: "0만원",
    minPrice: "0만원",
    priceRange: "0만원",
    totalListings: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(null);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(0,);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  const [similarCars, setSimilarCars] = useState([]);
  const [similarCarsLoading, setSimilarCarsLoading] = useState(false);
  const [similarCarsError, setSimilarCarsError] = useState(null);

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('userData');
  const [isLiked, setIsLiked] = useState(false);
  const componentMountCount = useRef(0);

  const [chatWidgetProps, setChatWidgetProps] = useState(null);
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
      const response = await fetch(`https://rakunko.store/api/user/like?carId=${carId}`, {
        method: newLikeState ? 'POST' : 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  const handleCarClick = (carId) => {
    navigate(`/description`, { state: { carId: carId, isSale: false } });
  };
  useEffect(() => {
    if (loading) {
      setChatWidgetProps({
        initialMessage: `${carData.result?.car?.name || '차량'} 관련 문의사항이 있으신가요?`,
        otherUserId: "temp",
        source: carData.result?.car?.source,
        carId: carId
      });
    }
  }, [loading]);
  const fetchSimilarCars = async () => {
    if(!carData.result?.car?.price) return;
    const carPrice = parseInt(carData.result?.car?.price);

    const minPrice = Math.max(0, carPrice - 300);
    const maxPrice = carPrice + 300;

    const similarCarFetchParams = {
      year: { min: '', max: '' },
      mileage: { min: '', max: '' },
      price: { min: minPrice, max: maxPrice },
      color: { min: '', max: '' },
      manufacturer: null,
      model: null,
      subModel: null,
      grade: null
    };
    setSimilarCarsLoading(true);
    try{
      fetchCarByInfo(
        0,
        6,
        similarCarFetchParams,
        setSimilarCars,
        setSimilarCarsError,
        setSimilarCarsLoading,
        null,
        false
      );
    }catch(error){
      console.error('유사 차량 로딩 오류:', error);
      setSimilarCarsError(error.message);
    }finally{
      setSimilarCarsLoading(false);
    }
  };
  const fetchModelStatistics = async () => {
    if(!carData.result?.car) return;
    setStatisticsLoading(true);

    try{
          // 모델 파라미터 설정
        const modelParams = {
          manufacturer: { name: carData.result.car.manufacturer },
          model: { name: carData.result.car.name.split(' ')[1] || carData.result.car.name },
          subModel: null,
          grade: null
        };
          // 임시 응답 저장 변수
      let tempResponse = { content: [] };

      // 모델 검색
      await fetchCarByModel(
        0,
        100, // 충분한 수의 데이터를 가져옴
        modelParams,
        (response) => { tempResponse = response; },
        setStatisticsError,
        setStatisticsLoading,
        null,
        false
      );
        // 검색 결과가 있으면 통계 계산
        if (tempResponse.content && tempResponse.content.length > 0) {
          const prices = tempResponse.content
                .map(car => parseInt(car.price))
                .filter(price => !isNaN(price) && price > 0);
          if (prices.length > 0) {
            // 통계 계산
            const sum = prices.reduce((a, b) => a + b, 0);
            const avg = Math.round(sum / prices.length);
            const max = Math.max(...prices);
            const min = Math.min(...prices);
            
            setModelStatistics({
              averagePrice: `${avg}만원`,
              maxPrice: `${max}만원`,
              minPrice: `${min}만원`,
              totalListings: prices.length
            });
          }
        }
      } catch (error) {
        setStatisticsError(error.message);
      } finally {
        setStatisticsLoading(false);
      }
    };
    // 3. 차량 데이터가 로드된 후 통계 계산
      useEffect(() => {
        if (carData?.result?.car) {
          fetchModelStatistics();
        }
      }, [carData]);
        useEffect(() => {
          if (carData?.result?.car && !similarCarsLoading && similarCars.length === 0) {
            fetchSimilarCars();
          }
        }, [carData]);
  const initializeChat = async () =>{
    try{
      setLoading(true);
      const carResponse = await fetchCarDescription(carId, setCarData, setError, setLoading, isSale);
          // carData가 설정된 후에 allLoading 설정
      setTimeout(() => {
        if(carResponse) {
          console.log('carResponse가 존재함, allLoading을 true로 설정');
          setAllLoading(true);
        }
      }, 0);
      
      
  }
  catch(error){
    console.error('데이터 로딩 오류:', error);
    setLoading(false);
  }
};

  // if (loading) return <div>로딩 중...</div>;
  // if (error) return <div>에러: {error}</div>;
  // if (!carData) return <div>차량 정보를 찾을 수 없습니다.</div>;
  useEffect(() => {
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
  }, [carData]);
  
useEffect(() => {
  initializeChat();
}, [carId]);
useEffect(() => {
  console.log(carData.result.car);
}, [carData]);

    return (
      <div className="buying-container">
        <div className="buying-nav-bar">
          <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />
        </div>

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
                  {!carData.result?.car?.user &&(
                    <button 
                      className={`like-button ${isLiked ? 'active' : ''}`}
                      onClick={handleLikeClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>)}
                    <div className="view-count">
                      <span>조회수 : </span>
                      <span>{carData.result?.car?.view}</span>
                    </div>
                  
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
                  {/* <div className="spec-row">
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
                  </div> */}
                  <div className="car-details-grid">
              {carData.result?.car && Object.entries({
                "연식": carData.result.car.age.slice(0, 10),
                "주행거리": `${carData.result.car.mileage}km`,
                "연료": carData.result.car.fuel,
                "배기량": carData.result.car.cc,
                "색상": carData.result.car.color,
                "차량번호": carData.result.car.number,
                "제조사": carData.result.car.manufacturer,
                "무게": carData.result.car.weight,

              }).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <label>{key}</label>
                  <span>{value || '-'}</span>
                </div>
              ))}
            </div>
                </div>
              </div>
            </div>

            
            
            {!carData.result?.car?.user && (
              <div className="car-link">
                <a href={carData.result?.car?.link} target="_blank" rel="noopener noreferrer">
                실제 매물 보러가기
                </a>
              </div>
            )}
          </div>
          

          <div className="result-grid">
            

          <div className="price-stats-section">
            <h2>시세 통계</h2>
            <div className="stats-grid">
              {statisticsLoading ? (
                <div>통계 로딩 중...</div>
              ) : statisticsError ? (
                <div>통계 로딩 오류: {statisticsError}</div>
              ) : (
                <>
                  <div className="stat-item">
                    <label>예측 가격</label>
                    <value>{parseInt(predictionData.predicted_price)}만원</value>
                  </div>
                  <div className="stat-item">
                    <label>평균 시세</label>
                    <value>{modelStatistics.averagePrice}</value>
                  </div>
                  <div className="stat-item">
                    <label>최고가</label>
                    <value>{modelStatistics.maxPrice}</value>
                  </div>
                  <div className="stat-item">
                    <label>최저가</label>
                    <value>{modelStatistics.minPrice}</value>
                  </div>
                  <div className="stat-item">
                    <label>매물 수</label>
                    <value>{modelStatistics.totalListings}대</value>
                  </div>
                </>
              )}
            </div>
          </div>

            <div className="similar-cars-section">
              <h2>유사 매물</h2>
              <div className="similar-cars-grid">
              {similarCarsLoading ? (
                  <div>유사 매물 로딩 중...</div>
                ) : similarCarsError ? (
                  <div>유사 매물 로딩 오류: {similarCarsError}</div>
                ) : similarCars.content && similarCars.content.length > 0 ? (
                  similarCars.content.map((car) => (
                    <div key={car.carId} className="car-item" onClick={() => handleCarClick(car.carId)}>
                      <div className="car-image-container">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="car-image"
                        />
                      </div>
                      <div className="car-details">
                        <h3>{car.name}</h3>
                        <p>{formatDateToYearMonth(car.age) || '날짜 정보 없음'} | {car.mileage || '정보 없음'}km</p>
                        <p className="price">{car.price || '정보 없음'}만원</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>유사한 가격대의 차량이 없습니다.</div>
                )}
              </div>
            </div>
          </div>

          {carData.result?.car?.user && (

          <>
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
          </>
        )}

        <Link to="/price-search" className="back-button">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}

export default Description;
