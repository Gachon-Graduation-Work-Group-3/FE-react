import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './MainPage.css';
import car1 from '../../img/car1.jpg';
import car2 from '../../img/car2.jpg';
import car5 from '../../img/car5.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCar } from '../../remote/searchcar';
import { formatDateToYearMonth } from '../../util/formatDateToYearMonth';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useUser } from '../../context/UserContext';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Slider from './Slider';  // Slider 컴포넌트 import
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
    // 스크롤 감지 및 현재 섹션 표시 기능
    const [activeSection, setActiveSection] = useState('image-slider');
  const navbarRef = useRef(null);
  const [headerState, setHeaderState] = useState({
    theme: 'dark',
    isScrolled: false
  });

  useEffect(() => {
    const navscroll = () => {
      if (navbarRef.current) {
        const scrollY = window.scrollY;  // window.scrollY 사용
        
        if (scrollY > 0) {
          setHeaderState(prevState => ({  // 이전 상태를 명시적으로 참조
            ...prevState,                 // 이전 상태의 모든 값을 복사 (theme: 'dark' 포함)
            isScrolled: true             // isScrolled만 업데이트
          }));
          // navbarRef.current.classList.add('scrolled');
        } else {
          setHeaderState(prevState => ({  // 이전 상태를 명시적으로 참조
            ...prevState,                 // 이전 상태의 모든 값을 복사 (theme: 'dark' 포함)
            isScrolled: false             // isScrolled만 업데이트
          }));
          // navbarRef.current.classList.remove('scrolled');
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

  // 각 섹션에 대한 ref 정의
  const imageSliderRef = useRef(null);
  const sliderSectionRef = useRef(null);
  const recommendationsRef = useRef(null);

  const [sliderAtBoundary, setSliderAtBoundary] = useState(null);
  const handleSliderBoundaryScroll = (boundary) => {
    console.log(`📌 슬라이더 경계 변경: ${boundary}`);
    setSliderAtBoundary(boundary);
  };

  useEffect(()=>{
    const container = document.querySelector('.container');
    let isScrolling = false;
    let lastSectionChange = Date.now();
    const sectionCooldown = 800;

    const handleWheel = (event) => {
    if(isScrolling || Date.now()-lastSectionChange< sectionCooldown){
      event.preventDefault();
      return;
    }
    console.log(`📌 휠 이벤트 감지: ${event.deltaY}`);
    const currentSection = activeSection;
    if(currentSection==='recommendations' &&event.deltaY<0){
      event.preventDefault();
      isScrolling=true;
      lastSectionChange=Date.now();

      sliderSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setTimeout(() => {
        isScrolling=false;
      }, 1500);
      return;
    }
    

    if(currentSection==='slider-section'){
      if(sliderAtBoundary==='top'&& event.deltaY<0){
        console.log(`📌 위쪽 경계 스크롤 시도, 이미지 슬라이더로 이동`);
        event.preventDefault();
        isScrolling=true;
        imageSliderRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          duration: 4000
        });
        setTimeout(() => {
          isScrolling = false;
        }, 1500);
        return
      }else if(sliderAtBoundary==='bottom'&& event.deltaY>0){
        console.log(`📌 아래쪽 경계 스크롤 시도, 추천 차량으로 이동`);
        event.preventDefault();
        isScrolling=true;
        recommendationsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          duration: 1500
        });
        setTimeout(() => {
          isScrolling = false;
        }, 1500);
        return
      }
    
    return;
    
  }
  const direction = event.deltaY>0?1:-1;
  console.log(`📌 방향: ${direction>0?'아래로':'위로'}`);
  let nextRef;
  if(direction>0){
    if(currentSection==='image-slider'){
      nextRef=sliderSectionRef;
      console.log(`📌 이미지 슬라이더에서 아래로 스크롤 시도, 슬라이더 섹션으로 이동`);
    }else if(currentSection==='slider-section'){
      nextRef=recommendationsRef;
      console.log(`📌 슬라이더 섹션에서 아래로 스크롤 시도, 추천 차량으로 이동`);
    }
  }else{
    if(currentSection==='recommendations'){
      nextRef=sliderSectionRef;
      console.log(`📌 추천 차량에서 위로 스크롤 시도, 슬라이더 섹션으로 이동`);
    }else if(currentSection==='slider-section'){
      nextRef=imageSliderRef;
      console.log(`📌 슬라이더 섹션에서 위로 스크롤 시도, 이미지 슬라이더로 이동`);
    }
  }


  if(nextRef){
    event.preventDefault();
    isScrolling=true;
    console.log(`📌 스크롤 이벤트 방지 및 스크롤 시작`);
    nextRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setTimeout(() => {
      isScrolling = false;
    }, 300);
  }

  if(currentSection === 'recommendations' && event.deltaY > 0) {
    event.preventDefault();
    return;
  }
};

if(container){
  container.addEventListener('wheel',handleWheel,{passive:false});
  console.log(`📌 휠 이벤트 리스너 추가`);
}
return ()=>{
  if(container){
    container.removeEventListener('wheel',handleWheel);
    console.log(`📌 휠 이벤트 리스너 제거`);
  }
}
  },[activeSection,sliderAtBoundary]);
  

  // 부드러운 스크롤 함수 추가
  const smoothScroll = (element, target, duration) => {
    const start = element.scrollTop;
    const distance = target - start;
    const startTime = performance.now();

    const easeInOutQuad = (t) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animation = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      element.scrollTop = start + distance * easeInOutQuad(progress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // scrollToSection 함수를 수정하여 smoothScroll 사용
  const scrollToSection = (ref) => {
    if (ref.current) {
      const container = document.querySelector('.container');
      const targetPosition = ref.current.offsetTop;
      
      smoothScroll(container, targetPosition, 4000); // 1.5초 동안 스크롤
    }
  };

    useEffect(() => {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
      };
      
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log(`📌 섹션 관찰: ${entry.target.id}`);
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);
      
      // 각 섹션 관찰 시작
      if (imageSliderRef.current) sectionObserver.observe(imageSliderRef.current);
      if (sliderSectionRef.current) sectionObserver.observe(sliderSectionRef.current);
      if (recommendationsRef.current) sectionObserver.observe(recommendationsRef.current);
      
      return () => {
        sectionObserver.disconnect();
      };
    }, []);
  const movetoDescription = (carId) => {
    console.log("Moving to description with carId:", carId); // 디버깅용
    navigate('/description', { 
      state: { 
        carId: carId 
      } 
    });
  };

  useEffect(() => {
    fetchCar(0, 20, setResponse, setError, setLoading, null, null).then((data) => {
      console.log('Car description:', data);
    })
      .catch((error) => {
        console.error('Car description을 가져오는 중 에러 발생:', error);
      });
  }, []);
  
  const getSliderDotClass = (position) => {
    if (activeSection !== 'slider-section') return '';
    
    switch(position) {
      case 'top':
        return sliderAtBoundary === 'top' ? 'active' : '';
      case 'middle':
        return sliderAtBoundary === null ? 'active' : '';
      case 'bottom':
        return sliderAtBoundary === 'bottom' ? 'active' : '';
      default:
        return '';
    }
  };

  return (
    <div className="container" style={{ minHeight: '320vh' }}>
      <div className="main-nav-bar" ref={navbarRef}>
        <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />
      </div>
      <div className="section-dots">
        <div 
          className={`dot ${activeSection === 'image-slider' ? 'active' : ''}`}
          onClick={() => scrollToSection(imageSliderRef)}
        />
        <div className="slider-dots">
          <div 
            className={`dot small ${getSliderDotClass('top')}`}
            onClick={() => scrollToSection(sliderSectionRef)}
          />
          <div 
            className={`dot small ${getSliderDotClass('middle')}`}
            onClick={() => scrollToSection(sliderSectionRef)}
          />
          <div 
            className={`dot small ${getSliderDotClass('bottom')}`}
            onClick={() => scrollToSection(sliderSectionRef)}
          />
        </div>
        <div 
          className={`dot ${activeSection === 'recommendations' ? 'active' : ''}`}
          onClick={() => scrollToSection(recommendationsRef)}
        />
      </div>

      <section id="image-slider" className="image-slider-section snap-section" ref={imageSliderRef}>
        <ImageSlider />
        <div className="scroll-hint" onClick={() => scrollToSection(sliderSectionRef)}>
          <div className="arrow-down"></div>
        </div>
      </section>
      
      <section id="slider-section" className="slider-section snap-section" ref={sliderSectionRef}>
      <Slider onBoundaryScroll={handleSliderBoundaryScroll} />
      </section>

        <section id="recommendations" className="recommendations snap-section" ref={recommendationsRef}>
            <h2 className="recommendation-title">얼마Car 추천</h2>
            <div className="cards-container">
                {loading || !response?.content ? (
                    <div className="loading-state">데이터를 불러오는 중입니다...</div>
                ) : error ? (
                  
                    
                    <div className="cards-slider-container">
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
                    </div>
                ) : response.content.length > 0 ? (
                  <div className='card-slider-container'>
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
