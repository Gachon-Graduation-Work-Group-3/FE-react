import React, { useEffect, useRef, useState } from 'react';
import './Slider.css';

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
        text: 'RANGE',
        title: 'TECHNOLOGY & AUTOMATION',
        description: 'Maximize your fleet with our digital solutions.',
        bulletPoints: [
            'Built to serve and inspire',
            'Access to innovation at unlock'
        ]
        },
        {
        text: 'ACCELERATION',
        title: 'PERFORMANCE METRICS',
        description: 'Experience unprecedented power and efficiency.',
        bulletPoints: [
            'Advanced drive systems',
            'Optimized energy consumption'
        ]
        },
        {
        text: 'TOTAL POWER',
        title: 'POWER DELIVERY',
        description: 'Ultimate performance at your command.',
        bulletPoints: [
            'Instant torque delivery',
            'Sustainable power output'
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
