export const fetchCarDescription = async (id, setResponse, setError, setLoading) => {
    try {
        console.log(id);
        setLoading(true); // 로딩 상태 시작
        const res = await fetch(`http://158.179.168.250:8080/api/car/description?carId=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors', // CORS 모드 설정
            credentials: 'include' // 쿠키 포함
        });

        if (!res.ok) {
            throw new Error('Failed to fetch data from the server.');
        }
        
        const data = await res.json();
        setResponse(data); // 서버 응답 저장
    } catch (err) {
        setError(err.message); // 에러 메시지 저장
    } finally {
        setLoading(false); // 로딩 상태 종료
    }
};
