import React, { useState, useEffect } from 'react';  
import './SearchPage.css';
import { Link } from 'react-router-dom';
import carDataJson from './data/transformed_carData.json';


function SearchPage() {
  
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSubModel, setSelectedSubModel] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const initialCarData = carDataJson;
  const [carData] = useState(initialCarData);


  const handleSearch = () => {
    console.log("검색:", {
      manufacturer: selectedManufacturer,
      model: selectedModel,
      subModel: selectedSubModel,
      grade: selectedGrade
    });
  };

  // 제조사 선택 핸들러
  const handleManufacturerSelect = (manufacturer) => {
    if (selectedManufacturer?.id === manufacturer.id) {
      // 같은 제조사를 다시 클릭하면 모든 선택 초기화
      setSelectedManufacturer(null);
      setSelectedModel(null);
      setSelectedSubModel(null);
      setSelectedGrade(null);
    } else {
      // 다른 ��조사 선택시 하위 선택 초기화
      setSelectedManufacturer(manufacturer);
      setSelectedModel(null);
      setSelectedSubModel(null);
      setSelectedGrade(null);
    }
  };

  // 모델 선택 핸들러
  const handleModelSelect = (model) => {
    if (selectedModel?.id === model.id) {
      // 같은 모델을 다시 클릭하면 모델부터 초기화
      setSelectedModel(null);
      setSelectedSubModel(null);
      setSelectedGrade(null);
    } else {
      // 다른 모델 선택시 하위 선택 초기화
      setSelectedModel(model);
      setSelectedSubModel(null);
      setSelectedGrade(null);
    }
  };

  // 세부모델 선택 핸들러
  const handleSubModelSelect = (subModel) => {
    if (selectedSubModel?.id === subModel.id) {
      // 같은 세부모델을 다시 클릭하면 세부모델부터 초기화
      setSelectedSubModel(null);
      setSelectedGrade(null);
    } else {
      // 다른 세부모델 선택시 등급 초기화
      setSelectedSubModel(subModel);
      setSelectedGrade(null);
    }
  };

  // 등급 선택 핸들러
  const handleGradeSelect = (grade) => {
    if (selectedGrade?.id === grade.id) {
      // 같은 등급을 다시 클릭하면 등급만 초기화
      setSelectedGrade(null);
    } else {
      setSelectedGrade(grade);
    }
  };

  return (
    <div className="container">
      <nav className="nav-bar">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item active">모델 검색</Link>
          <Link to="/selling" className="menu-item">내차 팔기</Link>
          <Link to="/buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
      </nav>



      <h1 className="search-title">차량 모델 검색</h1>
      <div className="search-content">
        <div className="search-box">
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

          <button className="search-button" onClick={handleSearch}>
            검색하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
