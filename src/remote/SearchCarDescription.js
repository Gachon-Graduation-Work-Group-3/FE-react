export const fetchCarDescription = async (carId, setCarData, setError, setLoading) => {
    const mockData = {
        result: {
            car: {
                carId: carId,
                name: "현대 그랜저 하이브리드",
                price: 45000000,
                mileage: 20000,
                color: "WHITE",
                brand: "현대",
                description: "2023년식 그랜저 하이브리드 완전무사고 차량입니다.",
                year: 2023,
                transmission: "자동",
                fuelType: "하이브리드",
                age: "2023-01-01",
                cc: 2999,
                fuelEff: 12.5,
                maxOut: 230,
                view: 100,
                newPrice: 50000000,
                fuel: "하이브리드",
                number: "123가4567",
                manufacturer: "현대",
                image: "car-image-url",
                source: "얼마일카",
            }
        }
    };

    try {
        console.log("fetchCarDescription 시작 - carId:", carId);  // 디버깅
        setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`http://158.179.168.250:8080/api/car/description?carId=${carId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log("API 응답:", res);  // 디버깅

        if (!res.ok) {
            console.log("API 실패, mock 데이터 사용:", mockData);  // 디버깅
            setCarData(mockData);
            return;
        }

        const data = await res.json();
        console.log("API 성공, 받은 데이터:", data);  // 디버깅
        setCarData(data);

    } catch (error) {
        console.error("API 에러 발생:", error);  // 디버깅
        console.log("에러로 인한 mock 데이터 사용:", mockData);  // 디버깅
        setCarData(mockData);  // 에러 발생 시에도 mock 데이터 설정
        setError(error.message);
    } finally {
        setLoading(false);
    }
};
