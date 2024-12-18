import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceSearchPage.css';
import { Link } from 'react-router-dom';

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
    // 검색 조건을 state로 전달하면서 결과 페이지로 이동
    navigate('/price-result', { state: searchParams });
  };

  return (
    <div className="container">
      <nav className="nav-bar">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
          <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/selling" className="menu-item">내차 팔기</Link>
          <Link to="/buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item active">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
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
                  onChange={(e) => setSearchParams({...searchParams, manufacturer: e.target.value})}
                >
                  <option value="">선택하세요</option>
                  <option value="hyundai">현대</option>
                  <option value="kia">기아</option>
                  <option value="genesis">제네시스</option>
                </select>
              </div>
              <div className="search-field">
                <label>모델</label>
                <select 
                  value={searchParams.model}
                  onChange={(e) => setSearchParams({...searchParams, model: e.target.value})}
                >
                  <option value="">선택하세요</option>
                  {/* 제조사에 따른 모델 옵션 */}
                </select>
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>세부모델</label>
                <select 
                  value={searchParams.subModel}
                  onChange={(e) => setSearchParams({...searchParams, subModel: e.target.value})}
                >
                  <option value="">선택하세요</option>
                  {/* 모델에 따른 세부모델 옵션 */}
                </select>
              </div>
              <div className="search-field">
                <label>등급</label>
                <select 
                  value={searchParams.grade}
                  onChange={(e) => setSearchParams({...searchParams, grade: e.target.value})}
                >
                  <option value="">선택하세요</option>
                  {/* 세부모델에 따른 등급 옵션 */}
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
