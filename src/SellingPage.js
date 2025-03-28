import React, { useState, useEffect } from 'react';
import './SellingPage.css';
import { Link, useNavigate } from 'react-router-dom';
import carDataJson from './data/transformed_carData.json';
import { useUser } from './context/UserContext';

function SellingPage() {
  const [formData, setFormData] = useState({
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

  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedSubModel, setSelectedSubModel] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [carData] = useState(carDataJson);
  const { isAuthenticated, user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // 전체 단계 수

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 여기에 서버로 데이터를 전송하는 로직 추가
    console.log('제출된 차량 정보:', formData);

    try {
      // FormData 객체 생성
      const formDataToSend = new FormData();
      
      // 이미지 파일 추가
      formData.images.forEach((file, index) => {
        formDataToSend.append('images', file);
      });
      
      // carSaleRequest JSON 생성 (현재 입력 필드 매핑)
      const carSaleRequest = {
        // 기존 입력 필드 매핑
        number: formData.licensePlate,
        manufacturer: formData.manufacturer,
        model: formData.model,
        submodel: formData.subModel,
        grade: formData.grade,
        name: `${formData.manufacturer} ${formData.model} ${formData.subModel} ${formData.grade}`,
        price: parseInt(formData.price) || 0,
        mileage: parseInt(formData.mileage) || 0,
        description: formData.description,
        
        // 날짜 형식 변환
        age: new Date(formData.year).toISOString(),
        firstReg: new Date(formData.year).toISOString(),
        
        // 기본값 설정
        cc: 0,
        sunroof: 0,
        engine: "gasoline",
        ownerChange: 0,
        frontSensor: 0,
        color: "white",
        insurCount: 0,
        panel: 0,
        totalLoss: 0,
        autoLight: 0,
        naviNon: 0,
        cruiseCont: 0,
        brand: formData.manufacturer,
        rearCamera: 0,
        floodTotalLoss: 0,
        newPrice: 0,
        naviGen: 0,
        torque: 0,
        rearWarn: 0,
        maxOut: 0,
        fuelEfficient: 0,
        panoSunroof: 0,
        frontCamera: 0,
        floodStatus: 0,
        otherDamageCount: 0,
        illegalModification: 0,
        aroundView: 0,
        myDamageAmount: 0,
        myDamageCount: 0,
        floodPartLoss: 0,
        fuel: "gasoline",
        heatBack: 0,
        otherDamageAmount: 0,
        heatHandle: 0,
        weight: 0,
        corrosion: 0,
        heatFront: 0,
        autoPark: 0,
        passAir: 0,
        link: "",
        replaceCount: 0,
        rearSensor: 0,
        theft: 0
      };
      

      formDataToSend.append('carSaleRequest', new Blob([JSON.stringify(carSaleRequest)], {
        type: 'application/json'
      }));
      // API 요청
      const response = await fetch('https://rakunko.store/api/car/sale/article', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('차량 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.isSuccess) {
        console.log('차량 등록 성공');
        // 3초 후 메인 페이지로 이동
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(data.message || '차량 등록에 실패했습니다.');
      }
      
    } catch (err) {
      console.error('차량 등록 실패:', err.message);
    }
  };

  const handleManufacturerSelect = (e) => {
    const manufacturer = carData.find(m => m.name === e.target.value);
    setSelectedManufacturer(manufacturer);
    setSelectedModel(null);
    setSelectedSubModel(null);
    setSelectedGrade(null);
    setFormData(prev => ({
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
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      subModel: e.target.value,
      grade: ''
    }));
  };

  const handleGradeSelect = (e) => {
    const grade = selectedSubModel?.grades.find(g => g.name === e.target.value);
    setSelectedGrade(grade);
    setFormData(prev => ({
      ...prev,
      grade: e.target.value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
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
        <div className="user-icon">
          {isAuthenticated ? (
              <div className="user-menu-container">
                <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="welcome-text">{user.name}님</span>
                  {showDropdown && (
                    <div className="user-dropdown">
                      
                      <button 
                        onClick={() => navigate('/mypage')} 
                        className="dropdown-item"
                      >
                        내 정보
                      </button>
                      <button 
                        onClick={() => navigate('/mypage/like')} 
                        className="dropdown-item"
                      >
                        좋아요
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
                ) : (
              <div className="main-user-icon">
                <Link to="/login" className="main-login">로그인</Link>
              </div>
            )}
        </div>
        </div>
      </nav>

      <form className="selling-form" onSubmit={handleSubmit}>
        <h2 className="form-title">내차 판매하기</h2>
        
        <div className="steps-container">
          <div className="steps-wrapper" style={{ transform: `translateX(-${currentStep * 25}%)` }}>
            {/* 1단계: 차량번호 */}
            <div className="car-info-section step">
              <h3 className="section-title">차량번호 입력</h3>
              <div className="form-group">
                <label className="form-label">차량번호</label>
                <div className="license-plate-input">
                  <input
                    type="text"
                    name="licensePlate"
                    className="form-input"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="예: 12가 3456"
                  />
                  <button type="button" className="verify-button">조회하기</button>
                </div>
              </div>
              <button type="button" className="next-button" onClick={handleNext}>다음</button>
            </div>

            {/* 2단계: 차량 기본 정보 */}
            <div className="car-info-section step">
              <h3 className="section-title">차량 기본 정보</h3>
              <div className="info-grid">
                <div className="form-group">
                  <label className="form-label">제조사</label>
                  <select
                    name="manufacturer"
                    className="form-select"
                    value={formData.manufacturer}
                    onChange={handleManufacturerSelect}
                  >
                    <option value="">제조사 선택</option>
                    {carData.map(manufacturer => (
                      <option key={manufacturer.id} value={manufacturer.name}>
                        {manufacturer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">모델</label>
                  <select
                    name="model"
                    className="form-select"
                    value={formData.model}
                    onChange={handleModelSelect}
                    disabled={!selectedManufacturer}
                  >
                    <option value="">모델 선택</option>
                    {selectedManufacturer?.models.map(model => (
                      <option key={model.id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">세부모델</label>
                  <select
                    name="subModel"
                    className="form-select"
                    value={formData.subModel}
                    onChange={handleSubModelSelect}
                    disabled={!selectedModel}
                  >
                    <option value="">세부모델 선택</option>
                    {selectedModel?.subModels.map(subModel => (
                      <option key={subModel.id} value={subModel.name}>
                        {subModel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">등급</label>
                  <select
                    name="grade"
                    className="form-select"
                    value={formData.grade}
                    onChange={handleGradeSelect}
                    disabled={!selectedSubModel}
                  >
                    <option value="">등급 선택</option>
                    {selectedSubModel?.grades.map(grade => (
                      <option key={grade.id} value={grade.name}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="step-buttons">
                <button type="button" className="prev-button" onClick={handlePrev}>이전</button>
                <button type="button" className="next-button" onClick={handleNext}>다음</button>
              </div>
            </div>

            {/* 3단계: 차량 상세 정보 */}
            <div className="car-info-section step">
              <h3 className="section-title">차량 상세 정보</h3>
              <div className="info-grid">
                <div className="form-group">
                  <label className="form-label">연식</label>
                  <input
                    type="text"
                    name="year"
                    className="form-input"
                    value={formData.year}
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
                    value={formData.mileage}
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
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="예: 2,500만원"
                  />
                </div>
              </div>
              <div className="step-buttons">
                <button type="button" className="prev-button" onClick={handlePrev}>이전</button>
                <button type="button" className="next-button" onClick={handleNext}>다음</button>
              </div>
            </div>

            {/* 4단계: 차량 사진 */}
            <div className="car-info-section step">
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
              <div className="step-buttons">
                <button type="button" className="prev-button" onClick={handlePrev}>이전</button>
                <button type="submit" className="next-button">등록 완료</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SellingPage;