import React, { useState, useEffect } from 'react';
import './BuyingPage.css';
import { Link, useNavigate } from 'react-router-dom';
import carDataJson from './data/transformed_carData.json';
import { fetchCar } from './remote/searchcar';
import { formatDateToYearMonth } from './util/formatDateToYearMonth';
import { handlePageChange } from './event/changevalue';
import { useUser } from './context/UserContext';
import Header from './components/Header';
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
const [response, setResponse] = useState({ data: [] }); // 초기값을 빈 배열로 설정
const [error, setError] = useState(null); // 에러 메시지 저장
const [loading, setLoading] = useState(true); // 로딩 상태 추가
const [priceRange, setPriceRange] = useState([0, 10000]); // 가격 범위 상태
const [mileageRange, setMileageRange] = useState([0, 300000]); // 주행 거리 범위 상태
const [selectedColors, setSelectedColors] = useState([]); // 선택된 색상 상태
const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
const [selectedManufacturer, setSelectedManufacturer] = useState(null);
const [selectedModel, setSelectedModel] = useState(null);
const [selectedSubModel, setSelectedSubModel] = useState(null);
const [selectedGrade, setSelectedGrade] = useState(null);
const [isSearchContentHovered, setIsSearchContentHovered] = useState(false);
const [cars, setCars] = useState([]);
const navigate = useNavigate();
const initialCarData = carDataJson;
const [carData] = useState(initialCarData);

const { isAuthenticated, user, logout } = useUser();
console.log('인증 상태:', isAuthenticated);
console.log('사용자 정보:', user);
const [showDropdown, setShowDropdown] = useState(false);
const [headerState, setHeaderState] = useState({
  theme: 'light',
  isScrolled: false
});

const handleLogout = async () => {
  try {
    await logout();
    navigate('/');
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
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


};

// 등급 선택 핸들러
const handleGradeSelect = async (grade) => {
  if (selectedGrade?.id === grade.id) {
    setSelectedGrade(null);
  } else {
    setSelectedGrade(grade);
  }

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

  fetchCar(
    currentPage - 1,
    12,
    setResponse,
    setError,
    setLoading,
    priceRange,
    mileageRange,
    selectedColors,
    setCurrentPage,
    setTotalPages
);


}, [currentPage]);

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
    <div className="buying-nav-bar">
      <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />
    </div>

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
          <button className="filter-search-button" >
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
          <div className="buying-search-box">
            <div className="filter-grid">
              <div className="filter-column">
                <h3 className="filter-title">제조사</h3>
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
                <h3 className="filter-title">모델</h3>
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
                <h3 className="filter-title">세부모델</h3>
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
                <h3 className="filter-title">등급</h3>
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
          <div className="selected-path-container">
            <div className="selected-path-content">
              <span className="selected-path-text">
                {getSelectedPath() || '차량을 선택하세요'}
              </span>
            </div>
          </div>
        )}
      </div>
            
          </div>

          <div className="search-cards-container">
            {loading ? (
                <div className="loading-state">
                    <p>데이터를 불러오는 중입니다...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                </div>
            ) : response.content.length > 0 ? (
                <div className="search-cards-grid">
                    {response.content.map((car, i) => (
                        <div key={i} className="search-card">
                            <div className="card-image-wrapper">
                                <img
                                    src={car.image}
                                    alt={`${car.name}`}
                                    className="search-car-image"
                                />
                            </div>
                            <div className="card-content">
                                <h3 className="car-title">{car.name}</h3>
                                <div className="car-specs">
                                    <span className="car-year">{formatDateToYearMonth(car.age) || '날짜 정보 없음'}</span>
                                    <span className="separator">•</span>
                                    <span className="car-mileage">{car.mileage || '주행 거리 정보 없음'}km</span>
                                </div>
                                <div className="car-price">
                                    <strong>{car.price || '가격 정보 없음'}</strong>
                                    <span className="price-unit">만원</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>추천 차량이 없습니다.</p>
                </div>
            )}
        </div>

          <div className="pagination">
          <button
                    className="page-button-prev-next"
                    onClick={() => handlePageChange(currentPage - 1, totalPages, currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Prev
                </button>

                {
                    (() => {
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, startPage + 4);

                        const pages = [];
                        for (let page = startPage; page <= endPage; page++) {
                            pages.push(page);
                        }

                        return pages.map(page => (
                            <button
                                className={`page-button ${currentPage === page ? 'active' : ''}`}
                                key={page}
                                onClick={() => handlePageChange(setCurrentPage, totalPages, page)}
                            >
                                {page}
                            </button>
                        ));
                    })()
                }

                <button
                    className="page-button-prev-next"
                    onClick={() => handlePageChange(setCurrentPage, totalPages, currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default BuyingPage;