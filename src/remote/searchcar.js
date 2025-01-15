export const fetchCar = async (page, size, setResponse, setError, setLoading,
    priceRange,
    mileageRange,
    selectedColors,
    setCurrentPage, setTotalPages) => {
    let url = `http://158.179.168.250:8080/api/car/search?page=${page}&size=${size}`;

    // 가격 범위가 존재하면 쿼리 파라미터에 추가
    if (priceRange && priceRange.length === 2) {
        url += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
    }

    // 주행 거리 범위가 존재하면 쿼리 파라미터에 추가
    if (mileageRange && mileageRange.length === 2) {
        url += `&minMileage=${mileageRange[0]}&maxMileage=${mileageRange[1]}`;
    }

    // 선택된 색상이 존재하면 쿼리 파라미터에 추가
    if (Array.isArray(selectedColors) && selectedColors.length > 0) {
        selectedColors.forEach(color => {
            url += `&color=${color}`;
        });
    }

    // 임시 데이터를 함수 상단에 정의
    const mockData = {
        result: {
            content: [
                {
                    id: 1,
                    name: "현대 그랜저 하이브리드",
                    price: 45000000,
                    mileage: 20000,
                    color: "WHITE",
                    brand: "현대",
                    description: "2023년식 그랜저 하이브리드 완전무사고 차량입니다.",
                    year: 2023,
                    transmission: "자동",
                    fuelType: "하이브리드"
                },
                {
                    id: 2,
                    name: "기아 K8",
                    price: 38000000,
                    mileage: 35000,
                    color: "BLACK",
                    brand: "기아",
                    description: "2022년식 K8 가솔린 모델입니다.",
                    year: 2022,
                    transmission: "자동",
                    fuelType: "가솔린"
                },
                {
                    id: 3,
                    name: "제네시스 G80",
                    price: 65000000,
                    mileage: 15000,
                    color: "GRAY",
                    brand: "제네시스",
                    description: "프리미엄 세단 G80 풀옵션 모델입니다.",
                    year: 2023,
                    transmission: "자동",
                    fuelType: "가솔린"
                },
                {
                    id: 4,
                    name: "테슬라 모델 3",
                    price: 55000000,
                    mileage: 25000,
                    color: "RED",
                    brand: "테슬라",
                    description: "테슬라 모델 3 퍼포먼스 에디션입니다.",
                    year: 2022,
                    transmission: "자동",
                    fuelType: "전기"
                },
                {
                    id: 5,
                    name: "BMW 520d",
                    price: 72000000,
                    mileage: 10000,
                    color: "BLUE",
                    brand: "BMW",
                    description: "BMW 5시리즈 디젤 모델입니다.",
                    year: 2023,
                    transmission: "자동",
                    fuelType: "디젤"
                }
            ],
            totalPages: 3,
            totalElements: 15,
            size: size,
            number: page
        }
    };

    try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            if (setTotalPages != null) {
                setTotalPages(mockData.result.totalPages);
            }
            setResponse(mockData.result);
            throw new Error('서버에서 데이터를 가져오는데 실패했습니다. 임시 데이터를 표시합니다.1');
        }

        const data = await res.json();
        if (setTotalPages != null) {
            setTotalPages(data.result.totalPages)
        }
        setResponse(data.result);
    } catch (err) {
        if (err.name === 'AbortError') {
            if (setTotalPages != null) {
                setTotalPages(mockData.result.totalPages);
            }
            setResponse(mockData.result); // 타임아웃 시 임시 데이터 설정
            setError('서버 연결 시간이 초과되었습니다. 임시 데이터를 표시합니다.1');
        } else {
            setError(err.message);
        }
    } finally {
        setLoading(false);
    }
};
