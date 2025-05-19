import React, { useEffect, useRef, useState } from 'react';
import './Slider.css';
import car_price_comparison from '../../img/car_price_compare.png';
import machine_learning from '../../img/machineLearning.png';
import various_information from '../../img/more_information.png';
const Slider = ({ onBoundaryScroll }) => {

    const [activeSection, setActiveSection] = useState(0);
    const sectionRefs = useRef([]);
    const containerRef = useRef(null);
    useEffect(() => {
    const handleScroll=() =>{
        if(!containerRef.current || !onBoundaryScroll) return;
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // 상단 경계 감지 (상단에서 10px 이내)
      if (scrollTop <= 10) {
        console.log("top");
        onBoundaryScroll("top");
      } 
      // 하단 경계 감지 (하단에서 10px 이내)
      else if (scrollHeight - scrollTop - clientHeight <= 10) {
        console.log("bottom");
        onBoundaryScroll("bottom");
      }      // 경계가 아님을 알림
      else {
        onBoundaryScroll(null);
      }
        
    };
    const container = containerRef.current;
    if(container){
        container.addEventListener('scroll', handleScroll);
        handleScroll();
    }
    return () => {
        if(container){
            container.removeEventListener('scroll', handleScroll);
        }
    };
    }, [onBoundaryScroll]);
    const sections = [
        {
        img: car_price_comparison,
        text: '최적의 가격',
        title: '요소 분석 & 비교',
        description: '다양한 요소를 분석하고 다른 차량들과 비교합니다.',
        bulletPoints: [
            '신뢰할 수 있는 가격 예측',
            '객관적인 비교 데이터 제공'
        ]
        },
        {
        img: machine_learning,
        text: '머신러닝 기반',
        title: '데이터 학습을 통한 예측',
        description: '과거 데이터를 학습하여 차량 가격을 정확하게 예측합니다.',
        bulletPoints: [
            '고도화된 AI 모델 적용',
            '지속적인 학습을 통한 정밀한 분석'
        ]
        },
        {
        img: various_information,
        text: '사용자 장터',
        title: '직접 올리고 비교하는 거래 공간',
        description: '누구나 차량 정보를 등록하고 다양한 조건의 차량과 비교할 수 있습니다.',
        bulletPoints: [
            '사용자 등록 기반의 거래 정보 제공',
            '자동 태깅과 유사 차량 추천 기능 탑재'
        ]
        },
        // 추가 섹션들...
    ];

    useEffect(() => {
        const observers = sections.map((_, index) => {
        const observer = new IntersectionObserver(
            (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                setActiveSection(index);
                }
            });
            },
            { threshold: 0.1 }
        );

        if (sectionRefs.current[index]) {
            observer.observe(sectionRefs.current[index]);
        }

        return observer;
        });

        return () => {
        observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    return (
        <div className="slider-container" ref={containerRef}>
        <div className="fixed-left-content">
            {sections.map((section, index) => (
            <h2 
                key={index}
                className={`text ${index === activeSection ? 'active' : 'outline'}`}
            >
                {section.text}
            </h2>
            ))}
        </div>
        <div className="scrollable-right-content">
            {sections.map((section, index) => (
            <div
                key={index}
                ref={(el) => (sectionRefs.current[index] = el)}
                className={`right-section ${index === activeSection ? 'in-view' : ''}`}
            >
                <div className="right-content">
                    <div className="right-content-img">
                        <img src={section.img} />
                    </div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul>
                    {section.bulletPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                    ))}
                </ul>
                </div>
            </div>
            ))}
        </div>
        </div>
  );
};

export default Slider;
