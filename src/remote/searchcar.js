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

try {
setLoading(true); // 로딩 상태 시작
const res = await fetch(url, {
method: 'GET',
headers: {
'Content-Type': 'application/json',
},
credentials: 'include',
});

if (!res.ok) {
throw new Error('Failed to fetch data from the server.');
}

const data = await res.json();
if(setTotalPages!= null)
    {
        setTotalPages(data.result.totalPages)
    }
setResponse(data.result); // 서버 응답 저장
} catch (err) {
setError(err.message); // 에러 메시지 저장
} finally {
console.log("Setting loading to false");
setLoading(false); // 로딩 상태 종료
}
};
