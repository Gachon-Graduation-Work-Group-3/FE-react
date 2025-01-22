import React,{useState,useEffect} from 'react';
import { useLocation, Link } from 'react-router-dom';
import {fetchCarDescription} from './remote/SearchCarDescription';
import ChatWidget from './components/ChatWidget';
import './PriceResultPage.css';
import './Description.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { fetchCarPrediction } from './remote/SearchCarprediction';

function Description() {
  const location = useLocation();
  const { carId } = location.state || {};
  
  // 1. 초기 상태에 기본값 설정
  const [carData, setCarData] = useState({
    result: {
      car: {
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

  useEffect(() => {
    console.log("Description useEffect - carId:", carId);  // 디버깅
    if (!carId) {
      setError('유효하지 않은 차량 ID입니다.');
      setLoading(false);
      return;
    }
    fetchCarDescription(carId, setCarData, setError, setLoading);
  }, [carId]);

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
        <nav className="nav-bar" >
        <div className="nav-bar-container">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item">내차 팔기</Link>
          <Link to="/Buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
        </div>
      </nav>

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
                <div className="main-image">
                  <img 
                    src={carData.result?.car?.image} 
                    alt={carData.result?.car?.name} 
                    className="car-image"
                  />
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

        <ChatWidget 
          initialMessage={`${carData.result?.car?.name || '차량'} 관련 문의사항이 있으신가요?`}
          context="car-description"
          source={carData.result?.car?.source}
        />

        <Link to="/price-search" className="back-button">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}

export default Description;
