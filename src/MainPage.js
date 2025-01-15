import React, { useState, useEffect } from 'react';
import './MainPage.css';
import car1 from './img/car1.jpg';
import car2 from './img/car2.jpg';
import car5 from './img/car5.jpg';
import g70Image from './img/g70.png';
import { RiMoneyDollarCircleLine } from 'react-icons/ri'; // 가격 아이콘
import { BiBrain } from 'react-icons/bi';  // 머신러닝 아이콘
import { IoInformationCircleOutline } from 'react-icons/io5'; // 정보 아이콘
import { Link, useNavigate } from 'react-router-dom';
import { fetchCar } from './remote/searchcar';
import { formatDateToYearMonth } from './util/formatDateToYearMonth';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
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
  const [response, setResponse] = useState({ data: [] }); // 초기값을 빈 배열로 설정
    const [error, setError] = useState(null); // 에러 메시지 저장
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carsPerPage = 3; // 한 번에 보여줄 차량 수

    const nextCars = () => {
      if (currentIndex + carsPerPage < response.content?.length) {
          setCurrentIndex(prev => prev + carsPerPage); // 한 번에 3개씩 이동하도록 수정
      }
  };

  const prevCars = () => {
      if (currentIndex > 0) {
          setCurrentIndex(prev => Math.max(0, prev - carsPerPage)); // 한 번에 3개씩 이동하도록 수정
      }
  };
    const movetoDescription = (carId) => {
      console.log("Moving to description with carId:", carId); // 디버깅용
      navigate('/description', { 
        state: { 
          carId: carId 
        } 
      });
    };

    useEffect(() => {
      fetchCar(0, 5,setResponse, setError, setLoading,null,null).then((data) => {
          console.log('Car description:', data);
      })
          .catch((error) => {
              console.error('Car description을 가져오는 중 에러 발생:', error);
          });
  }, []);
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

        <section className="recommendations">
            <h2 className="section-title">얼마Car 추천</h2>
            <div className="cards-container">
                {loading ? (
                    <div className="loading-state">데이터를 불러오는 중입니다...</div>
                ) : error ? (
                    <div className="error-state">{error}
                    <div className="cards-slider-container">
                        <button 
                                className="slider-button prev" 
                                onClick={prevCars}
                                disabled={currentIndex === 0}
                            >
                                <IoIosArrowBack />
                            </button>
                          <div className="cards-grid">
                        {response.content.map((car, i) => (
                            <div 
                                key={i} 
                                className="car-card" 
                                onClick={() => movetoDescription(car.carId)}
                            >
                                <div className="car-image-wrapper">
                                    <img
                                        src={car.image}
                                        alt={`${car.name}`}
                                        className="car-image"
                                    />
                                </div>
                                <div className="car-details">
                                    <h3 className="car-name">{car.name}</h3>
                                    <p className="car-info">{formatDateToYearMonth(car.age)} / {car.mileage}km</p>
                                    <p className="car-price">
                                        <strong>{car.price}만원</strong>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="slider-button next" 
                        onClick={nextCars}
                        disabled={currentIndex + carsPerPage >= response.content.length}
                    >
                        <IoIosArrowForward />
                    </button>
                    </div></div>
                ) : response.content.length > 0 ? (
                    <div className="cards-slider-container">
                        <button 
                                className="slider-button prev" 
                                onClick={prevCars}
                                disabled={currentIndex === 0}
                            >
                                <IoIosArrowBack />
                            </button>
                          <div className="cards-grid">
                        {response.content.map((car, i) => (
                            <div 
                                key={i} 
                                className="car-card" 
                                onClick={() => movetoDescription(car.carId)}
                            >
                                <div className="car-image-wrapper">
                                    <img
                                        src={car.image}
                                        alt={`${car.name}`}
                                        className="car-image"
                                    />
                                </div>
                                <div className="car-details">
                                    <h3 className="car-name">{car.name}</h3>
                                    <p className="car-info">{formatDateToYearMonth(car.age)} / {car.mileage}km</p>
                                    <p className="car-price">
                                        <strong>{car.price}만원</strong>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="slider-button next" 
                        onClick={nextCars}
                        disabled={currentIndex + carsPerPage >= response.content.length}
                    >
                        <IoIosArrowForward />
                    </button>
                    </div>
                ) : (
                    <div className="empty-state">추천 차량이 없습니다.</div>
                )}
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
