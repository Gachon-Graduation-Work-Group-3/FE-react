import axios from 'axios';

async function fetchCarPrediction(searchData) {
  try {
    // API 엔드포인트 URL
    const API_URL = 'https://rakunko.store/api/price/prediction';

    // 숫자 데이터 변환 및 쉼표 제거
    const mileage = parseInt(searchData.mileage.replace(/,/g, ''));
    const year = parseInt(searchData.year);

    // 요청 데이터 구성
    const requestData = {
      manufacturer_id: searchData.manufacturerId,
      model_id: searchData.modelId,
      sub_model_id: searchData.subModelId,
      grade_id: searchData.gradeId,
      year: year,
      mileage: mileage
    };

    console.log('Request Data:', requestData); // 요청 데이터 로깅

    // API 호출
    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data); // 응답 데이터 로깅
    
    // 응답 데이터 반환
    return {
      success: true,
      data: {
        predictedPrice: response.data.predicted_price,
        averagePrice: response.data.average_price || response.data.predicted_price,
        minPrice: response.data.min_price || (response.data.predicted_price * 0.9),
        maxPrice: response.data.max_price || (response.data.predicted_price * 1.1),
        confidence: response.data.confidence || 95
      }
    };

  } catch (error) {
    console.error('Price prediction error:', error);
    
    // 상세한 에러 정보 반환
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || '가격 예측 중 오류가 발생했습니다.',
        status: error.response?.status,
        details: error.response?.data
      }
    };
  }
}

export default fetchCarPrediction; 