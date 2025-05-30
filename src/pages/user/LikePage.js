import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './LikePage.css';
import Header from '../../components/Header';
import api from '../../api/axiosInstance';
function LikePage() {
  const [likedCars, setLikedCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [headerState, setHeaderState] = useState({
    theme: 'light',
    isScrolled: false
  });
  useEffect(() => {
    fetchLikedCars();
  }, []);
  const handleClick = (carId) => {
    navigate('/description',{
      state:{carId:carId}
    });
  };
  const fetchLikedCars = async (page = 0) => {
    try {
      console.log("fetchLikedCars 호출");
      setLoading(true);
      const response = await api.get(`/api/user/like?page=${page}&size=5`);
      console.log(response);
      const data = response.data;
      
      console.log(data);
      if (response.status !== 200) {
        throw new Error('좋아요 목록을 불러오는데 실패했습니다.');
      }
      if (response.status === 200) {
        setLikedCars(data.result.userLikeCars.content);
        setTotalPages(data.result.userLikeCars.totalPages);
        setCurrentPage(data.result.userLikeCars.number);
      } else {
        throw new Error(data.message || '좋아요 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleLikeClick = async (carId) => {
    try {
      // 좋아요 삭제 API 호출
      const response = await api.delete(`/api/user/like?userLikeId=${carId}`);
      
      if (response.status !== 200) {
        throw new Error('좋아요 삭제 중 오류가 발생했습니다.');
      }
      console.log(response);
      console.log("좋아요 삭제 완료");
      
      // 좋아요 목록 다시 불러오기
      fetchLikedCars(currentPage);
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      alert(error.message);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchLikedCars(newPage);
    }
  };
  

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <Header theme={headerState.theme} isScrolled={headerState.isScrolled}  />

      <div className="like-page-container">
        <h1 className="like-page-title">좋아요 목록</h1>
        
        {likedCars.length === 0 ? (
          <div className="empty-list">
            <p>좋아요한 차량이 없습니다.</p>
            <Link to="/Buying" className="search-link">차량 검색하러 가기</Link>
          </div>
        ) : (
          <div className="liked-cars-grid">
            {likedCars.map((car, index) => (
              <div key={`car-${car.carId}-${index}`} className="car-card">
                <div className="car-image-container">
                  <div  className="car-link" onClick={() => handleClick(car.carId)}>
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      className="car-image"
                    />
                  </div>
                  <button 
                    className="like-button active"
                    onClick={() => handleLikeClick(car.likeId)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className="car-details">
                  <h3 className="car-name">{car.name}</h3>
                  <p className="car-info">
                    {new Date(car.age).getFullYear()}년 | {car.mileage.toLocaleString()}km
                  </p>
                  <p className="car-price">{car.price}만원</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="page-button"
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={`page-${i}`}
                onClick={() => handlePageChange(i)}
                className={`page-number ${currentPage === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="page-button"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LikePage;
