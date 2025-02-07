export const fetchCarPrediction = async (carData, setPredictionData, setError, setLoading) => {
    try {
        setLoading(true);
        console.log("Prediction request data:", carData);

        
        // 안전한 문자열 변환 함수
        const safeToString = (value) => {
            return value != null ? value.toString() : '';
        };
    
        // 안전한 슬라이스 함수
        const safeSlice = (value, start, end) => {
            const str = safeToString(value);
            return str ? str.slice(start, end) : '';
        };
        // 안전한 날짜 변환
        const safeDate = (date) => {
            return date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
        };
        const processedData = JSON.stringify({
            age: String(carData.age).substring(0, 7),
            km: (carData.mileage) || 0,
            cc: parseInt(carData.cc) || 0,
            fuel_eff: parseInt(String(carData.fuel_eff).slice(0,-5)) || 0,
            high_out: parseInt(String(carData.high_out)) || 0,
            date: carData.date.substring(2, 4)+'/'+carData.date.substring(5, 7) || new Date().toISOString(),
            view: carData.view || 0,
            new_price: parseInt(carData.new_price) || 0,
            brand: 0
        });
        console.log(processedData);
        
        const response = await fetch('https://rakunko.store/price/prediction', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                
            },
            credentials: 'include',
            body: processedData
        });
        console.log(response);
        const data = await response.json();
        setPredictionData(data);
        
    } catch (err) {
        console.error('Price prediction error:', err);
        setError('가격 예측 서비스에 일시적인 문제가 있습니다.');
    } finally {
        setLoading(false);
    }
};
