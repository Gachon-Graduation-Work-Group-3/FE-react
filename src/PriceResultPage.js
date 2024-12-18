import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './PriceResultPage.css';
import g70Image from './img/g70.png';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function PriceResultPage() {
  const location = useLocation();
  const searchParams = location.state || {};
  const carData = {
    name: "제네시스 G70",
    subName: "(세부모델) (등급)",
    price: "1000만원",
    specs: [
      { label: "연도", value: "2020", rightLabel: "주행거리", rightValue: "1000km" },
      { label: "색", value: "Black", rightLabel: "변속기", rightValue: "Automatic" },
      { label: "구동 방식", value: "AWD", rightLabel: "연료", rightValue: "가솔린" },
      { label: "연비", value: "11km/l" }
    ],
    additionalInfo: {
      "연도": "2020",
      "주행거리": "1000km",
      "색": "Black",
      "변속기": "Automatic",
      "구동 방식": "AWD",
      "연료": "가솔린",
      "연비": "11km/l",
      "배기량": "2.0",
      "차량번호": "12가 3456",
      "사고유무": "무사고",
      "인승": "5인승",
      "제조사": "제네시스",
      "차종": "중형차"
    }
  };
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
      <nav className="nav-bar">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/selling" className="menu-item">내차 팔기</Link>
          <Link to="/buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item active">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
      </nav>

      <div className="result-content">
      <div className="search-summary">
          <h1>시세 검색 결과</h1>
          <div className="search-params">
            <span>{searchParams.manufacturer}</span>
            <span>{searchParams.model}</span>
            <span>{searchParams.subModel}</span>
            <span>{searchParams.grade}</span>
            <span>{searchParams.year}년식</span>
            <span>{searchParams.mileage}km</span>
          </div>
        </div>
      <div className="detail-content">
        <div className="car-header">
          <h1>{carData.name}</h1>
          <p className="sub-name">{carData.subName}</p>
        </div>

        <div className="car-main-info">
          <div className="car-image-section">
            <div className="main-image">
            <img 
              src={g70Image} 
              alt="제네시스 G70" 
              className="car-image"
            />  
              
            </div>
          </div>

          <div className="car-info-section">
          <h2 className="price-title">예측 가격</h2>
          <div className="price-value">{carData.price}</div>
          
          <div className="specs-table">
            {carData.specs.map((spec, index) => (
              <div key={index} className="spec-row">
                <div className="spec-cell">
                  <div className="spec-label">{spec.label}</div>
                  <div className="spec-value">{spec.value}</div>
                </div>
                {spec.rightLabel && (
                  <div className="spec-cell">
                    <div className="spec-label">{spec.rightLabel}</div>
                    <div className="spec-value">{spec.rightValue}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="car-details-grid">
          {Object.entries(carData.additionalInfo).map(([key, value]) => (
            <div key={key} className="detail-item">
              <label>{key}</label>
              <span>{value}</span>
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

        <Link to="/price-search" className="back-button">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}

export default PriceResultPage;
