export const fetchCarDescription = async (carId, setCarData, setError, setLoading, isSale) => {
    const url = isSale ? `https://rakunko.store/api/car/sale/search/description?carId=${carId}` : `https://rakunko.store/api/car/search/description?carId=${carId}`;

    try {
        console.log("fetchCarDescription 시작 - carId:", carId);  // 디버깅
        
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        console.log("url:", url);
        const res = await fetch(url, {
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
            return;
        }

        const data = await res.json();
        console.log("API 성공, 받은 데이터:", data);  // 디버깅
        setCarData(data);
        setLoading(true);

    } catch (error) {
        console.error("API 에러 발생:", error);  // 디버깅
        setError(error.message);
    } finally {
        setLoading(false);
    }
};
