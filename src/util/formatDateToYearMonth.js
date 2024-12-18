export const formatDateToYearMonth = (dateString) => {
    const date = new Date(dateString); // 문자열을 Date 객체로 변환
    const year = date.getFullYear();  // 연도 추출
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 추출 (0부터 시작하므로 +1 필요)
    return `${year}년 ${month}월식`;
};