import React, { useState, useEffect } from 'react';
import './BuyingPage.css';
import g70Image from './img/g70.png';
import { Link } from 'react-router-dom';
import carDataJson from './data/transformed_carData.json';
import axios from 'axios';

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
const [selectedManufacturer, setSelectedManufacturer] = useState(null);
const [selectedModel, setSelectedModel] = useState(null);
const [selectedSubModel, setSelectedSubModel] = useState(null);
const [selectedGrade, setSelectedGrade] = useState(null);
const [isSearchContentHovered, setIsSearchContentHovered] = useState(false);
const [cars, setCars] = useState([]);

const initialCarData = carDataJson;
const [carData] = useState(initialCarData);

// 서버에 데이터를 요청하는 함수
const fetchCarData = async (filters) => {
  try {
    const response = await axios.post('/api/cars/search', {
      manufacturer: selectedManufacturer?.id,
      model: selectedModel?.id,
      subModel: selectedSubModel?.id,
      grade: selectedGrade?.id,
      year: filters.year,
      mileage: filters.mileage,
      price: filters.price,
      color: filters.color.min
    });
    
    setCars(response.data);
  } catch (error) {
    console.error('차량 데이터 조회 실패:', error);
  }
};

// 검색 핸들러
const handleSearch = async () => {
  await fetchCarData(filters);
};

// 제조사 선택 핸들러
const handleManufacturerSelect = async (manufacturer) => {
  if (selectedManufacturer?.id === manufacturer.id) {
    setSelectedManufacturer(null);
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
  } else {
    setSelectedManufacturer(manufacturer);
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
  }
  
  // 선택 변경 후 즉시 데이터 요청
  await fetchCarData({
    ...filters,
    manufacturer: manufacturer?.id
  });
};

// 모델 선택 핸들러
const handleModelSelect = async (model) => {
  if (selectedModel?.id === model.id) {
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
  } else {
    setSelectedModel(model);
    setSelectedSubModel(null);
    setSelectedGrade(null);
  }

  await fetchCarData({
    ...filters,
    model: model?.id
  });
};

// 세부모델 선택 핸들러
const handleSubModelSelect = async (subModel) => {
  if (selectedSubModel?.id === subModel.id) {
    setSelectedSubModel(null);
    setSelectedGrade(null);
  } else {
    setSelectedSubModel(subModel);
    setSelectedGrade(null);
  }

  await fetchCarData({
    ...filters,
    subModel: subModel?.id
  });
};

// 등급 선택 핸들러
const handleGradeSelect = async (grade) => {
  if (selectedGrade?.id === grade.id) {
    setSelectedGrade(null);
  } else {
    setSelectedGrade(grade);
  }

  await fetchCarData({
    ...filters,
    grade: grade?.id
  });
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

// 컴포넌트 마운트 시 초기 데이터 로드
useEffect(() => {
  fetchCarData(filters);
}, []);

// 선택된 항목들을 표시하는 함수
const getSelectedPath = () => {
  const parts = [];
  if (selectedManufacturer) parts.push(selectedManufacturer.name);
  if (selectedModel) parts.push(selectedModel.name);
  if (selectedSubModel) parts.push(selectedSubModel.name);
  if (selectedGrade) parts.push(selectedGrade.name);
  return parts.join(' > ');
};

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
            
      <div className="buying-search-content"
        onMouseEnter={() => setIsSearchContentHovered(true)}
        onMouseLeave={() => setIsSearchContentHovered(false)}
      >
        {isSearchContentHovered ? (
          // 호버 시 전체 검색 옵션 표시
          <div className="buying-search-box">
            <div className="filter-grid">
              <div className="filter-column">
                <h3>제조사</h3>
                <div className="filter-options">
                  {carData.map(manufacturer => (
                    <div
                      key={manufacturer.id}
                      className={`filter-option ${selectedManufacturer?.id === manufacturer.id ? 'selected' : ''}`}
                      onClick={() => handleManufacturerSelect(manufacturer)}
                    >
                      {manufacturer.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-column">
                <h3>모델</h3>
                <div className="filter-options">
                  {selectedManufacturer?.models.map(model => (
                    <div
                      key={model.id}
                      className={`filter-option ${selectedModel?.id === model.id ? 'selected' : ''}`}
                      onClick={() => handleModelSelect(model)}
                    >
                      {model.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-column">
                <h3>세부모델</h3>
                <div className="filter-options">
                  {selectedModel?.subModels.map(subModel => (
                    <div
                      key={subModel.id}
                      className={`filter-option ${selectedSubModel?.id === subModel.id ? 'selected' : ''}`}
                      onClick={() => handleSubModelSelect(subModel)}
                    >
                      {subModel.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-column">
                <h3>등급</h3>
                <div className="filter-options">
                  {selectedSubModel?.grades.map(grade => (
                    <div
                      key={grade.id}
                      className={`filter-option ${selectedGrade?.id === grade.id ? 'selected' : ''}`}
                      onClick={() => handleGradeSelect(grade)}
                    >
                      {grade.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 호버하지 않았을 때는 선택된 경로만 표시
          <div className="selected-path">
            {getSelectedPath() || '차량을 선택하세요'}
          </div>
        )}
      </div>
            
          </div>

          <div className="car-grid">
            {cars.map((car, index) => (
              <div key={car.id || index} className="car-card">
                <div className="car-image-container">
                  <img 
                    src={car.image || g70Image} 
                    alt={car.name} 
                    className="car-image"
                  />
                </div>
                <div className="car-info">
                  <h3>{car.name}</h3>
                  <p>{car.year}년/{car.mileage}</p>
                  <p className="price">{car.price}</p>
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