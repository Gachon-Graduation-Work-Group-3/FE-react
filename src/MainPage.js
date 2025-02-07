import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './MainPage.css';
import car1 from './img/car1.jpg';
import car2 from './img/car2.jpg';
import car5 from './img/car5.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCar } from './remote/searchcar';
import { formatDateToYearMonth } from './util/formatDateToYearMonth';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useUser } from './context/UserContext';
// 슬라이더에 사용할 이미지 배열

const sliderImages = [
  {
    url: car1,
    title: "안전한 중고차 거래의 시작",
    subtitle: "신뢰할 수 있는 파트너",
    buttonText: "가입하기",
    buttonLink: "/login",
    buttonStyle: "black"
  },
  {
    url: car2,
    title: "최고의 중고차를 최저가로",
    subtitle: "머신러닝 기반 시세 분석",
    buttonText: "시세 검색하기",
    buttonLink: "/price-search",
    buttonStyle: "black"
  },
  {
    url: car5,
    title: "검증된 차량만 엄선하여",
    subtitle: "믿을 수 있는 차량 정보",
    buttonText: "내차 사기",
    buttonLink: "/Buying",
    buttonStyle: "black"
  }
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
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
            <div className="text-overlay-content">
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-subtitle">{slide.subtitle}</p>
            <Link 
              to={slide.buttonLink}
              className={`slide-button ${slide.buttonStyle}`}
            >
              {slide.buttonText}
            </Link>
            </div>
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
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null); // 에러 메시지 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const navigate = useNavigate();
  
  const cardsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const navbarRef = useRef(null);
  const { isAuthenticated, user, logout } = useUser();
  console.log('인증 상태:', isAuthenticated);
  console.log('사용자 정보:', user);
  const [showDropdown, setShowDropdown] = useState(false);

  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  useEffect(() => {
    const navscroll = () => {
      if (navbarRef.current) {
        const scrollY = window.scrollY;  // window.scrollY 사용
        
        if (scrollY > 0) {
          navbarRef.current.classList.add('scrolled');
        } else {
          navbarRef.current.classList.remove('scrolled');
        }
      }
    };  // scroll state는 여기서 직접 사용하지 않으므로 의존성 불필요
  
    console.log("Effect mounted");
    // window에 이벤트 리스너 추가
    window.addEventListener('scroll', navscroll);
    // 초기 상태 체크
    navscroll();
    
    return () => {
      console.log("Removing scroll listener");
      window.removeEventListener('scroll', navscroll);
    };
  }, []); // navscroll을 의존성으로 추가

  // checkScroll 함수 수정
  const checkScroll = useCallback(() => {
    if (cardsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = cardsRef.current;
      // 스크롤 위치 디버깅
      console.log('Scroll position:', {
        scrollLeft,
        scrollWidth,
        clientWidth,
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < (scrollWidth - clientWidth)
      });
      
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < (scrollWidth - clientWidth));
    }
  }, []);
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const currentRef = cardsRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll);
      // 초기 상태 체크
      checkScroll();
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
    };
  }, [checkScroll]);

  // 이전/다음 버튼 핸들러 수정
  const prevCars = useCallback(() => {
    if (cardsRef.current) {
      const cardWidth = cardsRef.current.children[0].offsetWidth;
      const gap = 32; // gap: 2rem = 32px
      const scrollAmount = -(cardWidth + gap);
      
      cardsRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });

      // 스크롤 후 상태 업데이트를 위한 setTimeout
      setTimeout(checkScroll, 500); // 스크롤 애니메이션 완료 후 체크
    }
  }, [checkScroll]);

  const nextCars = useCallback(() => {
    if (cardsRef.current) {
      const cardWidth = cardsRef.current.children[0].offsetWidth;
      const gap = 32;
      const scrollAmount = cardWidth + gap;
      
      cardsRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });

      setTimeout(checkScroll, 500);
    }
  }, [checkScroll]);

  const movetoDescription = (carId) => {
    console.log("Moving to description with carId:", carId); // 디버깅용
    navigate('/description', { 
      state: { 
        carId: carId 
      } 
    });
  };

  useEffect(() => {
    fetchCar(0, 5, setResponse, setError, setLoading, null, null).then((data) => {
      console.log('Car description:', data);
    })
      .catch((error) => {
        console.error('Car description을 가져오는 중 에러 발생:', error);
      });
  }, []);
  
  // const handleScroll = () => {
  //   console.log("Scroll event fired");
      
  //     console.log("scrollY", window.scrollY);
    
  //     if (window.scrollY > 0) {
  //       setScroll(true)
  //       console.log("Added scrolled class");
  //     } else {
  //       setScroll(false);
  //       console.log("Removed scrolled class");
  //     }
  // };

  // useEffect(() => {
  //   console.log("Effect mounted");
  //   // 초기 상태 체크
  //   console.log("Adding scroll listener");
  //   window.addEventListener('scroll', handleScroll);
    
  //   return () => {
  //     console.log("Removing scroll listener");
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [handleScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      
      entries.forEach((entry, index) => {
        // 이미 visible 클래스가 있으면 스킵
        if (entry.target.classList.contains('visible')) return;
        
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 200);
        }
      });
    }, {
      threshold: 0.7,
      // 한 번만 관찰하도록 설정
      once: true
    });

    const elements = document.querySelectorAll('.feature-item');
    
    // 이미 observe 중인 요소는 다시 observe하지 않음
    elements.forEach(item => {
      if (!item.classList.contains('visible')) {
        observer.observe(item);
      }
    });

    // 클린업 함수
    return () => {
      observer.disconnect();
    };
  }, []); // 빈 의존성 배열

  return (
    <div className="container" style={{ minHeight: '300vh' }}>
      <nav className="main-nav-bar" ref={navbarRef}>
        <div className="main-nav-bar-container">
        <Link to="/" className="main-logo">얼마일카</Link>
        <div className="main-menu-items">
          <Link to="/search" className="main-menu-item">모델 검색</Link>
          <Link to="/Selling" className="main-menu-item">내차 팔기</Link>
          <Link to="/Buying" className="main-menu-item">내차 사기</Link>
          <Link to="/price-search" className="main-menu-item">시세 검색</Link>
        </div>
        <div className="main-icon-container">
          
          <div className="main-user-icon">
          {isAuthenticated ? (
              <div className="user-menu-container">
                <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="welcome-text">{user.name}님</span>
                  {showDropdown && (
                    <div className="user-dropdown">
                      
                      <button 
                        onClick={() => navigate('/mypage')} 
                        className="dropdown-item"
                      >
                        내 정보
                      </button>
                      <button 
                        onClick={() => navigate('/mypage/like')} 
                        className="dropdown-item"
                      >
                        좋아요
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
                ) : (
              <div className="main-user-icon">
                <Link to="/login" className="main-login">로그인</Link>
              </div>
            )}
        </div>
        </div>
        </div>
      </nav>

      <ImageSlider />
      
      <section className="main-features-section">
        <div className="feature-container">
            <div className="feature-item">
              <div className="feature-num">
                01
              </div>
            <div className="feature-text">
            <h3 className="feature-title">최고의 가격</h3>
            <p className="feature-description">
            다양한 요소 분석 & 다른 차량들과 비교</p>
            </div>
            
            </div>

            <div className="feature-item">
              <div className="feature-num">02</div>
            <div className="feature-text">
            <h3 className="feature-title">머신러닝 기반</h3>
            <p className="feature-description">
            과거 데이터 학습하여 차량 가격을 예측
            </p>
            </div>
            </div>

            <div className="feature-item">
              <div className="feature-num">03</div>
            <div className="feature-text">
            <h3 className="feature-title">다양한 정보</h3>
            <p className="feature-description">
              다양한 변수를 고려해 세밀한 가격 예측을 제공
            </p>
            </div>
            </div>
        </div>
        </section>

        <section className="recommendations">
            <h2 className="recommendation-title">얼마Car 추천</h2>
            <div className="cards-container">
                {loading ? (
                    <div className="loading-state">데이터를 불러오는 중입니다...</div>
                ) : error ? (
                  
                    
                    <div className="cards-slider-container">
                    <button 
                                className="slider-button prev" 
                                onClick={prevCars}
                                disabled={!canScrollLeft}
                            >
                                <IoIosArrowBack />
                            </button>
                          <div className="cards-grid" ref={cardsRef}>
                    
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
                        disabled={!canScrollRight}
                    >
                        <IoIosArrowForward />
                    </button>
                    </div>
                ) : response.content.length > 0 ? (
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
                ) : (
                    <div className="empty-state">추천 차량이 없습니다.</div>
                )}
            </div>
        </section>

      {/* <section className="popular-cars-section">
        <h2 className="main-section-title">주간 인기 차량</h2>
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
      </section> */}
    </div>
  );
}

export default MainPage;
