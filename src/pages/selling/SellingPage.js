import React, { useState, useEffect, useContext } from 'react';
import './SellingPage.css';
import { Link, useNavigate } from 'react-router-dom';
import carDataJson from '../../data/transformed_carData.json';
import { UserContext } from '../../context/UserContext';
import Header from '../../components/Header';
import api from '../../api/axiosInstance';

function SellingPage() {
  const { logout } = useContext(UserContext);
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
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('userData');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // 전체 단계 수

  const [headerState, setHeaderState] = useState({
    theme: 'light',
    isScrolled: false
  });
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
 // 폼 유효성 검사 함수 추가
  const validateCurrentStep = () => {
    // 각 단계별 유효성 검사
    switch(currentStep) {
      case 0: // 차량번호 단계
        if (!formData.licensePlate || formData.licensePlate.trim() === '') {
          alert('차량번호를 입력해주세요.');
          return false;
        }
        // 차량번호 형식 검사 (예: 12가 3456 형식)
        const licensePlateRegex = /^\d{2,3}[가-힣]\s?\d{4}$/;
        if (!licensePlateRegex.test(formData.licensePlate)) {
          alert('올바른 차량번호 형식이 아닙니다. (예: 12가 3456)');
          return false;
        }
        break;
      
      case 1: // 차량 기본 정보 단계
        if (!formData.manufacturer) {
          alert('제조사를 선택해주세요.');
          return false;
        }
        if (!formData.model) {
          alert('모델을 선택해주세요.');
          return false;
        }
        if (!formData.subModel) {
          alert('세부모델을 선택해주세요.');
          return false;
        }
        if (!formData.grade) {
          alert('등급을 선택해주세요.');
          return false;
        }
        break;
      
      case 2: // 차량 상세 정보 단계
        if (!formData.year) {
          alert('연식을 입력해주세요.');
          return false;
        }
        // 연식 형식 검사 (4자리 숫자)
        if (!/^\d{4}$/.test(formData.year)) {
          alert('연식은 4자리 숫자로 입력해주세요. (예: 2020)');
          return false;
        }
        
        if (!formData.mileage) {
          alert('주행거리를 입력해주세요.');
          return false;
        }
        // 주행거리 형식 검사 (숫자만 허용)
        if (!/^\d+$/.test(formData.mileage.replace(/,/g, ''))) {
          alert('주행거리는 숫자만 입력해주세요.');
          return false;
        }
        
        if (!formData.price) {
          alert('판매가격을 입력해주세요.');
          return false;
        }
        // 판매가격 형식 검사 (숫자만 허용)
        if (!/^\d+$/.test(formData.price.replace(/,/g, ''))) {
          alert('판매가격은 숫자만 입력해주세요.');
          return false;
        }
        break;
      
      case 3: // 차량 사진 단계
        if (formData.images.length === 0) {
          alert('최소 1장 이상의 차량 사진을 업로드해주세요.');
          return false;
        }
        break;
    }
    
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 여기에 서버로 데이터를 전송하는 로직 추가
    console.log('제출된 차량 정보:', formData);
    

    try {
      // FormData 객체 생성
      const formDataToSend = new FormData();
      
      // 이미지 파일 추가
      formData.images.forEach(file => {
        formDataToSend.append('images', file);
      });
      console.log(`licensePlate 값: "${formData.licensePlate}", 타입: ${typeof formData.licensePlate}`);
      // carSaleRequest JSON 생성 (현재 입력 필드 매핑)
      const carSaleRequest = {
        // 기존 입력 필드 매핑
        number: formData.licensePlate,
        manufacturer: formData.manufacturer,
        brand: formData.manufacturer,
        model: formData.model,
        submodel: formData.subModel,
        grade: formData.grade,
        name: `${formData.manufacturer} ${formData.model} ${formData.subModel} ${formData.grade}`,
        price: parseInt(formData.price)||0,
        mileage: parseInt(formData.mileage)||0,
        description: formData.description,    
        // 날짜 형식 변환
        age: "2025-04-13",
        firstReg: "2025-04-13",
        // 기본값 설정
        cc: 0,
        engine: "gasoline",
        color: "흰색",
        maxOut: 0,
        fuelEfficient: 0,
        fuel: "gasoline",
        weight: 0,
        torque: 0,
        newPrice: 0,
        images: formData.images.map(file => file.name).join(','),
        // cc: 0,
        // engine: "string",
        // color: "wh",
        // firstReg: "2025-04-13",
        // brand: "string",
        // submodel: "string",
        // price: 0,
        // model: "string",
        // number: "string",
        // newPrice: 0,
        // mileage: 0,
        // torque: 0,
        // maxOut: 0,
        // name: "string",
        // fuelEfficient: 0,
        // manufacturer: "string",
        // fuel: "string",
        // grade: "string",
        // weight: 0,
        // description: "string",
        // age: "2025-04-13",
        // images: "string",
      };
      formDataToSend.append('carSaleRequest', JSON.stringify(carSaleRequest));
      console.log(carSaleRequest);


      const response = await api.post('api/car/sale/article', formDataToSend);

      console.log(JSON.stringify(response));

      // 올바른 방식
      if (response.status !== 200) {
        throw new Error('차량 등록에 실패했습니다.');
      }
      
      if (response.status === 200) {
        console.log('차량 등록 성공');
        // const complete = await api.patch(`api/car/sale/completed?carId=55`, {
        // });
        // console.log(complete);
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        throw new Error( '차량 등록에 실패했습니다.');
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

    if (!validateCurrentStep()) {
      return; // 유효성 검사 실패 시 다음 단계로 넘어가지 않음
    }

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
      <div className="selling-nav-bar">
        <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />
      </div>

      <form className="selling-form" onSubmit={handleSubmit}>
        <h2 className="form-title">내차 판매하기</h2>
        
        <div className="steps-container">
          <div className="steps-wrapper">
            {/* 1단계: 차량번호 */}
            <div className={`car-selling-section step first-step ${currentStep === 0 ? 'active-step' : 'hidden-step'}`}>
              <div className="car-selling-section-wrapper">
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
                <button type="button" className="next-button right" onClick={handleNext}>다음</button>
              </div>
            </div>

            {/* 2단계: 차량 기본 정보 */}
            <div className={`car-selling-section step ${currentStep === 1 ? 'active-step' : 'hidden-step'}`}>
              <div className="car-selling-section-wrapper basic-info-wrapper">
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
            </div>

            {/* 3단계: 차량 상세 정보 */}
            <div className={`car-selling-section step ${currentStep === 2 ? 'active-step' : 'hidden-step'}`}>
              <div className="car-selling-section-wrapper basic-info-wrapper2">
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
            </div>

            {/* 4단계: 차량 사진 */}
            <div className={`car-selling-section step last-step ${currentStep === 3 ? 'active-step' : 'hidden-step'}`}>
              <div className="car-selling-section-wrapper">
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
        </div>
      </form>
    </div>
  );
}

export default SellingPage;