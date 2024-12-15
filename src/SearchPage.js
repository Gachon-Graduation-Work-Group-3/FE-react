import React, { useState } from 'react';
import './SearchPage.css';
import { Link } from 'react-router-dom';

function SearchPage() {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSubModel, setSelectedSubModel] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

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
      // 다른 제조사 선택시 하위 선택 초기화
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
    <div className="search-container">
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

      <div className="search-content">
        <h1 className="search-title">차량 모델 검색</h1>
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
