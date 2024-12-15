import React, { useState } from 'react';
import './BuyingPage.css';
import g70Image from './img/g70.png';
import { Link } from 'react-router-dom';
import FilterTree from './FilterTree';

function BuyingPage() {
  const [filteredCars, setFilteredCars] = useState([]);
  const [filters, setFilters] = useState({
  year: { min: '', max: '' },
  mileage: { min: '', max: '' },
  price: { min: '', max: '' },
  color: { min: '', max: '' },
  manufacturer: null,
  model: null,
  subModel: null,
  grade: null
});
  // 검색 핸들러
  // 검색 핸들러
const handleSearch = () => {
  const filtered = cars.filter(car => {
    let matches = true;

    // 제조사, 모델, 서브모델, 등급 필터링
    if (filters.manufacturer) {
      matches = matches && car.manufacturer === filters.manufacturer.id;
    }
    if (filters.model) {
      matches = matches && car.model === filters.model.id;
    }
    if (filters.subModel) {
      matches = matches && car.subModel === filters.subModel.id;
    }
    if (filters.grade) {
      matches = matches && car.grade === filters.grade.id;
    }

    // 연식 필터링
    if (filters.year.min) {
      matches = matches && car.year >= parseInt(filters.year.min);
    }
    if (filters.year.max) {
      matches = matches && car.year <= parseInt(filters.year.max);
    }

    // 주행거리 필터링
    if (filters.mileage.min) {
      matches = matches && parseInt(car.mileage) >= parseInt(filters.mileage.min);
    }
    if (filters.mileage.max) {
      matches = matches && parseInt(car.mileage) <= parseInt(filters.mileage.max);
    }

    // 가격 필터링
    if (filters.price.min) {
      matches = matches && parseInt(car.price) >= parseInt(filters.price.min);
    }
    if (filters.price.max) {
      matches = matches && parseInt(car.price) <= parseInt(filters.price.max);
    }

    // 색상 필터링
    if (filters.color.min) {
      matches = matches && car.color === filters.color.min;
    }

    return matches;
  });

  setFilteredCars(filtered);
  console.log('필터링된 결과:', filtered);
};
  const handleFilterChange = (category, type, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };
  
  const cars = [
    {
      id: 1,
      manufacturer: 1,
      model: 1,
      name: "제네시스 G70",
      year: "2021",
      mileage: "3044km",
      price: "4320만원",
      image: g70Image
    },
    {
      id: 2,
      manufacturer: 1,
      model: 2,
      name: "아반떼 CN7",
      year: "2022",
      mileage: "15000km",
      price: "2580만원",
      image: g70Image
    },
    {
      id: 3,
      manufacturer: 2,
      model: 3,
      name: "기아 K5",
      year: "2023",
      mileage: "5000km",
      price: "3150만원",
      image: g70Image
    }
    // 필요한 만큼 더 추가 가능
  ];
  const carData = [
    {
      id: 1,
      name: "현대",
      models: [
        {
          id: 1,
          name: "아반떼",
          subModels: [
            {
              id: 1,
              name: "CN7",
              grades: [
                { id: 1, name: "모던" },
                { id: 2, name: "프리미엄" },
                { id: 3, name: "인스퍼레이션" }
              ]
            },
            {
              id: 2,
              name: "MD",
              grades: [
                { id: 4, name: "스타일" },
                { id: 5, name: "프리미엄" }
              ]
            }
          ]
        },
        {
          id: 2,
          name: "소나타",
          subModels: [
            {
              id: 3,
              name: "DN8",
              grades: [
                { id: 6, name: "프리미엄" },
                { id: 7, name: "익스클루시브" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "기아",
      models: [
        {
          id: 3,
          name: "K5",
          subModels: [
            {
              id: 4,
              name: "DL3",
              grades: [
                { id: 8, name: "트렌디" },
                { id: 9, name: "프레스티지" },
                { id: 10, name: "노블레스" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "제네시스",
      models: [
        {
          id: 4,
          name: "G70",
          subModels: [
            {
              id: 5,
              name: "RG2",
              grades: [
                { id: 11, name: "스포츠" },
                { id: 12, name: "럭셔리" }
              ]
            }
          ]
        }
      ]
    }
  ];
  

  
  return (
    <div className="buying-container">
      <nav className="nav-bar">
      <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
        <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item ">내차 팔기</Link>
          <Link to="/Buying" className="menu-item active">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3>연식</h3>
            <div className="filter-inputs">
              <input
                type="number"
                placeholder="최소 연식"
                value={filters.year.min}
                onChange={(e) => handleFilterChange('year', 'min', e.target.value)}
                className="filter-input"
              />
              <span className="filter-separator">~</span>
              <input
                type="number"
                placeholder="최대 연식"
                value={filters.year.max}
                onChange={(e) => handleFilterChange('year', 'max', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>주행거리</h3>
            <div className="filter-inputs">
              <input
                type="number"
                placeholder="최소 거리"
                value={filters.mileage.min}
                onChange={(e) => handleFilterChange('mileage', 'min', e.target.value)}
                className="filter-input"
              />
              <span className="filter-separator">~</span>
              <input
                type="number"
                placeholder="최대 거리"
                value={filters.mileage.max}
                onChange={(e) => handleFilterChange('mileage', 'max', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>가격</h3>
            <div className="filter-inputs">
              <input
                type="number"
                placeholder="최소 가격"
                value={filters.price.min}
                onChange={(e) => handleFilterChange('price', 'min', e.target.value)}
                className="filter-input"
              />
              <span className="filter-separator">~</span>
              <input
                type="number"
                placeholder="최대 가격"
                value={filters.price.max}
                onChange={(e) => handleFilterChange('price', 'max', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>색상</h3>
            <div className="filter-inputs">
              <select
                value={filters.color.min}
                onChange={(e) => handleFilterChange('color', 'min', e.target.value)}
                className="filter-input"
              >
                <option value="">색상 선택</option>
                <option value="white">흰색</option>
                <option value="black">검정</option>
                <option value="silver">은색</option>
                <option value="gray">회색</option>
                {/* 추가 색상 옵션 */}
              </select>
            </div>
          </div>
          <button className="filter-search-button" onClick={handleSearch}>
            검색하기
          </button>
        </div>

        <div className="main-content">
          <div className="search-header">
            <div className="search-tabs">
            <FilterTree 
            data={carData} 
            onFilterChange={handleFilterChange}
          />
            <h2>Used Cars for Sale</h2>
          </div>

          <div className="car-grid">
            {Array(12).fill().map((_, index) => (
              <div key={index} className="car-card">
                <div className="car-image-container">
                  <img 
                    src={g70Image} 
                    alt="제네시스 G70" 
                    className="car-image"
                  />
                </div>
                <div className="car-info">
                  <h3>제네시스 G70</h3>
                  <p>2021년/13,044km</p>
                  <p className="price">4,320만원</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button key={num} className={num === 1 ? 'active' : ''}>
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default BuyingPage;