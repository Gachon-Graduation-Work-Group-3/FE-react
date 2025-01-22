import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceSearchPage.css';
import { Link } from 'react-router-dom';
import carDataJson from './data/transformed_carData.json';

function PriceSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    manufacturer: '',
    model: '',
    subModel: '',
    grade: '',
    year: '',
    mileage: ''
  });

  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSubModel, setSelectedSubModel] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [carData] = useState(carDataJson);

  const handleManufacturerSelect = (e) => {
    const manufacturer = carData.find(m => m.name === e.target.value);
    setSelectedManufacturer(manufacturer);
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
    setSearchParams(prev => ({
      ...prev,
      manufacturer: e.target.value,
      model: '',
      subModel: '',
      grade: ''
    }));
  };

  const handleModelSelect = (e) => {
    const model = selectedManufacturer?.models.find(m => m.name === e.target.value);
    setSelectedModel(model);
    setSelectedSubModel(null);
    setSelectedGrade(null);
    setSearchParams(prev => ({
      ...prev,
      model: e.target.value,
      subModel: '',
      grade: ''
    }));
  };

  const handleSubModelSelect = (e) => {
    const subModel = selectedModel?.subModels.find(sm => sm.name === e.target.value);
    setSelectedSubModel(subModel);
    setSelectedGrade(null);
    setSearchParams(prev => ({
      ...prev,
      subModel: e.target.value,
      grade: ''
    }));
  };

  const handleGradeSelect = (e) => {
    const grade = selectedSubModel?.grades.find(g => g.name === e.target.value);
    setSelectedGrade(grade);
    setSearchParams(prev => ({
      ...prev,
      grade: e.target.value
    }));
  };

  const handleSearch = () => {
    navigate('/price-result', { state: searchParams });
  };

  return (
    <div className="container">
      <nav className="nav-bar" >
        <div className="nav-bar-container">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item">내차 팔기</Link>
          <Link to="/Buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
        </div>
      </nav>

      <div className="search-content">
        <h1 className="search-title">시세 검색</h1>
        <div className="search-box">
          <div className="search-grid">
            <div className="search-row">
              <div className="search-field">
                <label>제조사</label>
                <select 
                  value={searchParams.manufacturer}
                  onChange={handleManufacturerSelect}
                >
                  <option value="">선택하세요</option>
                  {carData.map(manufacturer => (
                    <option key={manufacturer.id} value={manufacturer.name}>
                      {manufacturer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-field">
                <label>모델</label>
                <select 
                  value={searchParams.model}
                  onChange={handleModelSelect}
                  disabled={!selectedManufacturer}
                >
                  <option value="">선택하세요</option>
                  {selectedManufacturer?.models.map(model => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>세부모델</label>
                <select 
                  value={searchParams.subModel}
                  onChange={handleSubModelSelect}
                  disabled={!selectedModel}
                >
                  <option value="">선택하세요</option>
                  {selectedModel?.subModels.map(subModel => (
                    <option key={subModel.id} value={subModel.name}>
                      {subModel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-field">
                <label>등급</label>
                <select 
                  value={searchParams.grade}
                  onChange={handleGradeSelect}
                  disabled={!selectedSubModel}
                >
                  <option value="">선택하세요</option>
                  {selectedSubModel?.grades.map(grade => (
                    <option key={grade.id} value={grade.name}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>연식</label>
                <input 
                  type="text" 
                  placeholder="예: 2020"
                  value={searchParams.year}
                  onChange={(e) => setSearchParams({...searchParams, year: e.target.value})}
                />
              </div>
              <div className="search-field">
                <label>주행거리</label>
                <input 
                  type="text" 
                  placeholder="예: 50000 (km)"
                  value={searchParams.mileage}
                  onChange={(e) => setSearchParams({...searchParams, mileage: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button className="search-button" onClick={handleSearch}>
            시세 검색
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceSearchPage;
