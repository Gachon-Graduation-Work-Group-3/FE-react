import React,{memo, useCallback, useState,useEffect,useRef, useContext} from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {fetchCarDescription} from '../../remote/SearchCarDescription';
import ChatWidget from '../../components/ChatWidget';
import './PriceResultPage.css';
import './Description.css';
import { fetchCarPrediction } from '../../remote/SearchCarprediction';
import Header from '../../components/Header';
import {fetchCarByInfo, fetchCarByModel} from '../../remote/searchcar';




function SaleDescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { carId, isSale } = location.state || {};
  const [headerState, setHeaderState] = useState({
    theme: 'light',
    isScrolled: false
  });
  const chatWidgetPropsRef = useRef(null);
  // 1. 초기 상태에 기본값 설정
  const [carData, setCarData] = useState(
    {
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
  );
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(null);
  const [error, setError] = useState(null);
  // 통계 데이터 상태 관리 추가
  const [modelStatistics, setModelStatistics] = useState({
    averagePrice: "0만원",
    maxPrice: "0만원",
    minPrice: "0만원",
    totalListings: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState(null);

  // 유사 차량 상태 관리 추가
  const [similarCars, setSimilarCars] = useState([]);
  const [similarCarsLoading, setSimilarCarsLoading] = useState(false);
  const [similarCarsError, setSimilarCarsError] = useState(null);
    const [predictionData, setPredictionData] = useState(0,);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('userData');
  const [isLiked, setIsLiked] = useState(false);

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
    // 유사 차량 가져오기 함수 추가
  const fetchSimilarCars = async () => {
    if(!carData.result?.carSale?.price) return;
    const carPrice = parseInt(carData.result?.carSale?.price);

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
        true
      );
    }catch(error){
      console.error('유사 차량 로딩 오류:', error);
      setSimilarCarsError(error.message);
    }finally{
      setSimilarCarsLoading(false);
    }
  };

  // 시세 통계 가져오기 함수 추가
  const fetchModelStatistics = async () => {
    if(!carData.result?.carSale) return;
    setStatisticsLoading(true);

    try{
      // 모델 파라미터 설정
      const modelParams = {
        manufacturer: { name: carData.result.carSale.manufacturer },
        model: { name: carData.result.carSale.name.split(' ')[1] || carData.result.carSale.name },
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
        true
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

  // 차량 상세 정보로 이동 함수
  const handleCarClick = (carId) => {
    navigate(`/description`, { state: { carId: carId, isSale: false } });
  };
  // Header.js에 태그 파싱 함수 추가
  const parseTags = (tagString) => {
    console.log(tagString);
    if (!tagString) return [];
    try {
      const cleanString = tagString.replace(/^"|"$/g, '');
      const tags = JSON.parse(cleanString).map(tag => tag.replace(/\\"/g, ''));
      return tags;
    } catch (e) {
      console.error('태그 파싱 에러:', e);
      return [];
    }
  };
  // 차량 데이터가 로드된 후 통계 계산
  useEffect(() => {
    if (carData?.result?.carSale) {
      fetchModelStatistics();
    }
  }, [carData]);

  // 차량 데이터가 로드된 후 유사 차량 가져오기
  useEffect(() => {
    if (carData?.result?.carSale && !similarCarsLoading && similarCars.length === 0) {
      fetchSimilarCars();
    }
  }, [carData]);

  const initializeChat = async () =>{
    try{
      setLoading(true);
      const responseData = await fetchCarDescription(carId, setCarData, setError, setLoading, isSale);
          // carData가 설정된 후에 allLoading 설정
      if(responseData) {
        console.log('responseData', responseData);
        if (responseData.result?.carSale && !chatWidgetPropsRef.current) {
          chatWidgetPropsRef.current = {
            initialMessage: `${responseData.result.carSale.name || '차량'} 관련 문의사항이 있으신가요?`,
            sellerId: responseData.result.carSale.user?.id,
            source: responseData.result.carSale.link,
            carId: carId
          };
          setChatWidgetProps(chatWidgetPropsRef.current);
        }
        setLoading(false);
      }
      
      
  }
  catch(error){
    console.error('데이터 로딩 오류:', error);
    setLoading(false);
  }
};
    useEffect(() => {
        console.log(carData);
    }, [carData]);

  // if (loading) return <div>로딩 중...</div>;
  // if (error) return <div>에러: {error}</div>;
  // if (!carData) return <div>차량 정보를 찾을 수 없습니다.</div>;
  useEffect(() => {
    if (carData?.result?.carSale) {
      const predictionRequestData = {
        age: carData.result.carSale.age,
        mileage: carData.result.carSale.mileage,
        cc: carData.result.carSale.cc,
        fuel_eff: carData.result.carSale.fuelEff,
        high_out: carData.result.carSale.maxOut,
        date: new Date().toISOString(),
        view: carData.result.carSale.view,
        new_price: carData.result.carSale.newPrice,
        brand: carData.result.carSale.brand
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
  
  // 시세 통계 데이터
  const statistics = {
    averagePrice: "3,100만원",
    maxPrice: "3,200만원",
    minPrice: "3,000만원",
    priceRange: "200만원",
    totalListings: 156
  };

  const handleBackClick = () => {
    navigate(-1); // 브라우저의 뒤로 가기와 동일한 효과
  };

    return (
      <div className="container">
        <div className="buying-nav-bar">
          <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />
        </div>

        <div className="result-content">
          <div className="search-summary">
            <h1>차량 상세 정보</h1>
          </div>

          <div className="detail-content">
            <div className="car-header">
              <h1>{carData.result?.carSale?.name || '차량명 없음'}</h1>
            </div>

            <div className="car-main-info">
              <div className="car-image-section">
                <div className="main-image-container">
                  <img 
                    src={carData.result?.carSale?.image} 
                    alt={carData.result?.carSale?.name} 
                    className="car-image"
                  />
                  {!carData.result?.carSale?.user &&(
                    <button 
                      className={`like-button ${isLiked ? 'active' : ''}`}
                      onClick={handleLikeClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>)}
                    <div className="view-count">
                    {carData.result?.carSale?.tags && (
                    <div className="header-tags">
                      {parseTags(carData.result?.carSale?.tags).map((tag, index) => (
                        <span key={index} className="header-tag">#{tag}</span>
                      ))}
                      <div className="view">
                        <span>조회수 : </span>
                        <span>{carData.result?.carSale?.view}</span>
                      </div>
                    </div>
                  )}
                    </div>
                    
                </div>
              </div>

              <div className="car-info-section">

                <div className="specs-table">
                <div className="spec-price">
                  <div className="price-card prediction">
                    <h1>예측가격</h1>
                    <h2 className={
                      parseInt(predictionData.predicted_price) > parseInt(carData.result?.carSale?.price) 
                        ? "price-higher" 
                        : "price-lower"
                    }>
                      {parseInt(predictionData.predicted_price)}만원
                    </h2>
                    {carData.result?.carSale?.price && (
                      <div className={`price-difference ${
                        parseInt(predictionData.predicted_price) > parseInt(carData.result?.carSale?.price) 
                          ? "difference-positive" 
                          : "difference-negative"
                      }`}>
                        {(() => {
                          const predictedPrice = parseInt(predictionData.predicted_price);
                          const actualPrice = parseInt(carData.result?.carSale?.price);
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
                    <h2>{carData.result?.carSale?.price}만원</h2>
                  </div>
                </div>
                  <div className="car-details-grid">
              {carData.result?.carSale && Object.entries({
                "연식": carData.result.carSale.age.slice(0, 10),
                "주행거리": `${carData.result.carSale.mileage}km`,
                "연료": carData.result.carSale.fuel,
                "배기량": carData.result.carSale.cc,
                "색상": carData.result.carSale.color,
                "차량번호": carData.result.carSale.number,
                "제조사": carData.result.carSale.manufacturer,
                "무게": carData.result.carSale.weight,
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


            
            {!carData.result?.carSale?.user && (
              <div className="car-link">
                <a href={carData.result?.carSale?.link} target="_blank" rel="noopener noreferrer">
                  차량 상세 정보 보기
                </a>
              </div>
            )}
          </div>
          

          <div className="result-grid">
            {/* <div className="price-chart-section">
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
            </div> */}

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
                        <p>{car.age ? car.age.slice(0, 7) : '날짜 정보 없음'} | {car.mileage || '정보 없음'}km</p>
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
          <div>
              {chatWidgetPropsRef.current && (
                <ChatWidget 
                  key="fixed-chat-widget" 
                  {...chatWidgetPropsRef.current}
                />
              )}
            </div>
        <Link to="/sale-buying" className="back-button">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}

export default SaleDescription;
