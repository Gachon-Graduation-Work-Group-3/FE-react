export const handlePageChange = (setCurrentPage, totalPages, page) => {
    if (page < 1 || page > totalPages) return; // 페이지 범위 체크
    setCurrentPage(page);
};