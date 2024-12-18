import React, { useState, useEffect } from 'react';
import './MainPage.css';
import car1 from './img/car1.jpg';
import car2 from './img/car2.jpg';
import car5 from './img/car5.jpg';
import g70Image from './img/g70.png';
import { RiMoneyDollarCircleLine } from 'react-icons/ri'; // 가격 아이콘
import { BiBrain } from 'react-icons/bi';  // 머신러닝 아이콘
import { IoInformationCircleOutline } from 'react-icons/io5'; // 정보 아이콘
import { Link } from 'react-router-dom';


// 슬라이더에 사용할 이미지 배열
const sliderImages = [
  {
    url: car1,
    title: "안전한 중고차 거래의 시작",
    subtitle: "신뢰할 수 있는 파트너"
  },
  {
    url: car2,
    title: "최고의 중고차를 최저가로",
    subtitle: "머신러닝 기반 시세 분석"
  },
  {
    url: car5,
    title: "검증된 차량만 엄선하여",
    subtitle: "믿을 수 있는 차량 정보"
  }
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    
    <div className="slider-container">
      {sliderImages.map((slide, index) => (
        <div
          key={index}
          className="slide"
          style={{
            opacity: currentSlide === index ? 1 : 0,
            backgroundImage: `url(${slide.url})`
          }}
        >
          <div className="text-overlay">
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-subtitle">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <div className="slide-indicators">
        {sliderImages.map((_, index) => (
          <div
            key={index}
            className={`indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

function MainPage() {
  return (
    <div className="container">
      <nav className="nav-bar">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item">내차 팔기</Link>
          <Link to="/Buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="like-icon">♡</div>
          <div className="user-icon">
            <Link to="/login" className="login">로그인</Link></div>
        </div>
      </nav>
      <ImageSlider />
      
      <section className="main-features-section">
        <div className="feature-container">
            <div className="feature-item">
            <div className="feature-icon">
                <RiMoneyDollarCircleLine size={50} color="#007bff" />
            </div>
            <h3 className="feature-title">최고의 가격</h3>
            <p className="feature-description">
            차량의 연식, 주행 거리, 모델 등 다양한 요소를 분석하여,
             다른 차량들과 비교한 최적의 가격을 예측합니다. 
             이를 통해 구매자가 합리적인 가격에 차량을 구입할 수 있도록 돕습니다.</p>
            </div>

            <div className="feature-item">
            <div className="feature-icon">
                <BiBrain size={50} color="#007bff" />
            </div>
            <h3 className="feature-title">머신러닝 기반</h3>
            <p className="feature-description">
            과거 데이터를 학습하여 차량 가격을 예측하며, 
            예측 정확도를 높이기 위해 지속적으로 모델을 개선합니다. 
            복잡한 패턴을 분석해 더 신뢰성 있는 가격 예측을 제공합니다.
            </p>
            </div>

            <div className="feature-item">
            <div className="feature-icon">
                <IoInformationCircleOutline size={50} color="#007bff" />
            </div>
            <h3 className="feature-title">다양한 정보</h3>
            <p className="feature-description">
            제조사, 사고 이력, 차량 상태 등의 정보를 종합적으로 반영하여 
            보다 정확한 가격 예측을 지원합니다. 다양한 변수를 고려해 세밀한 가격 예측을 제공합니다.
            </p>
            </div>
        </div>
        </section>

        <section className="car-list-section">
          <h2 className="section-title">얼마일카 추천</h2>
          <div className="car-grid">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="car-card">
                <div className="main-car-image">
                  <img src={g70Image} alt="제네시스 G70" />
                </div>
                <div className="car-info">
                  <h3 className="car-name">제네시스 G70</h3>
                  <div className="car-details">2021년/13,044km</div>
                  <div className="car-price">4,320만원</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      <section className="popular-cars-section">
        <h2 className="section-title">주간 인기 차량</h2>
        <div className="table-container">
          <table className="styled-table">
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <tr key={num} className="table-row">
                  <td className="table-cell rank-cell">
                    <button className="rank-button">사진</button>
                  </td>
                  <td className="table-cell number-cell">
                    {num}
                  </td>
                  <td className="table-cell model-cell">
                    Gv70
                  </td>
                  <td className="table-cell info-cell">
                    2021/01/304km
                  </td>
                  <td className="table-cell price-cell">
                    43200만원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default MainPage;
