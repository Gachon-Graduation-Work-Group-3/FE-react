import React, { useState } from 'react';
import './SellingPage.css';
import { Link } from 'react-router-dom';
function SellingPage() {
  const [carInfo, setCarInfo] = useState({
    licensePlate: '',
    manufacturer: '',
    model: '',
    subModel: '',
    grade: '',
    year: '',
    mileage: '',
    price: '',
    description: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // 이미지 미리보기 생성
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previews]);
    
    // 이미지 파일 저장
    setCarInfo(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 여기에 서버로 데이터를 전송하는 로직 추가
    console.log('제출된 차량 정보:', carInfo);
  };

  return (
    <div className="container">
      <nav className="nav-bar">
        <Link to="/" className="logo">얼마일카</Link>
        <div className="menu-items">
        <Link to="/search" className="menu-item">모델 검색</Link>
          <Link to="/Selling" className="menu-item active">내차 팔기</Link>
          <Link to="/Buying" className="menu-item">내차 사기</Link>
          <Link to="/price-search" className="menu-item">시세 검색</Link>
        </div>
        <div className="icon-container">
          <div className="icon">♡</div>
          <div className="icon">👤</div>
        </div>
      </nav>

      <form className="selling-form" onSubmit={handleSubmit}>
        <h2 className="form-title">내차 판매하기</h2>

        <div className="car-info-section">
          <h3 className="section-title">차량번호 입력</h3>
          <div className="form-group">
            <label className="form-label">차량번호</label>
            <div className="license-plate-input">
              <input
                type="text"
                name="licensePlate"
                className="form-input"
                value={carInfo.licensePlate}
                onChange={handleInputChange}
                placeholder="예: 12가 3456"
              />
              <button 
                type="button" 
                className="verify-button"
                onClick={() => {
                  // 차량번호 조회 로직 추가
                  console.log("차량번호 조회:", carInfo.licensePlate);
                }}
              >
                조회하기
              </button>
            </div>
          </div>
        </div>

        <div className="car-info-section">
          <h3 className="section-title">차량 기본 정보</h3>
          <div className="info-grid">
            <div className="form-group">
              <label className="form-label">제조사</label>
              <select 
                name="manufacturer" 
                className="form-select"
                value={carInfo.manufacturer}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                <option value="hyundai">현대</option>
                <option value="kia">기아</option>
                <option value="genesis">제네시스</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">모델</label>
              <select 
                name="model" 
                className="form-select"
                value={carInfo.model}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                {/* 제조사에 따른 모델 옵션 */}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">세부모델</label>
              <select 
                name="subModel" 
                className="form-select"
                value={carInfo.subModel}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                {/* 모델에 따른 세부모델 옵션 */}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">등급</label>
              <select 
                name="grade" 
                className="form-select"
                value={carInfo.grade}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                {/* 세부모델에 따른 등급 옵션 */}
              </select>
            </div>
          </div>
        </div>

        <div className="car-info-section">
          <h3 className="section-title">차량 상세 정보</h3>
          <div className="info-grid">
            <div className="form-group">
              <label className="form-label">연식</label>
              <input
                type="text"
                name="year"
                className="form-input"
                value={carInfo.year}
                onChange={handleInputChange}
                placeholder="예: 2020"
              />
            </div>

            <div className="form-group">
              <label className="form-label">주행거리</label>
              <input
                type="text"
                name="mileage"
                className="form-input"
                value={carInfo.mileage}
                onChange={handleInputChange}
                placeholder="예: 30,000km"
              />
            </div>

            <div className="form-group">
              <label className="form-label">판매가격</label>
              <input
                type="text"
                name="price"
                className="form-input"
                value={carInfo.price}
                onChange={handleInputChange}
                placeholder="예: 2,500만원"
              />
            </div>
          </div>
        </div>

        <div className="car-info-section">
          <h3 className="section-title">차량 설명</h3>
          <div className="form-group">
            <textarea
              name="description"
              className="form-input"
              value={carInfo.description}
              onChange={handleInputChange}
              rows="5"
              placeholder="차량 상태, 옵션 등 상세 정보를 입력해주세요."
            />
          </div>
        </div>

        <div className="car-info-section">
          <h3 className="section-title">차량 사진</h3>
          <div className="image-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              클릭하여 사진을 업로드하세요
            </label>
          </div>
          {previewImages.length > 0 && (
            <div className="preview-images">
              {previewImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          판매 등록하기
        </button>
      </form>
    </div>
  );
}

export default SellingPage;