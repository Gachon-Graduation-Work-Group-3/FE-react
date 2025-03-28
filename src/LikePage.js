import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import './LikePage.css';

function LikePage() {
  const [likedCars, setLikedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  
  const fetchLikedCars = async (page = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`https://rakunko.store/api/user/like?page=${page}&size=5`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'a01023931663@gmail.com'
        }
      });
      
      if (!response.ok) {
        throw new Error('좋아요 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.isSuccess) {
        setLikedCars(data.result.searchCarsQueries.content);
        setTotalPages(data.result.searchCarsQueries.totalPages);
        setCurrentPage(data.result.searchCarsQueries.number);
      } else {
        throw new Error(data.message || '좋아요 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchLikedCars();
  }, [isAuthenticated, navigate]);
  
  const handleLikeClick = async (carId) => {
    try {
      // 좋아요 삭제 API 호출
      const response = await fetch(`https://rakunko.store/api/user/like?userLikeId=${carId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'a01023931663@gmail.com'
        }
      });
      
      if (!response.ok) {
        throw new Error('좋아요 삭제 중 오류가 발생했습니다.');
      }
      
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
  
  const handleLogout = async () => {
    try {
      const response = await fetch('https://rakunko.store/api/user/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <nav className="nav-bar">
        <div className="nav-bar-container">
          <Link to="/" className="logo">얼마일카</Link>
          <div className="menu-items">
            <Link to="/search" className="menu-item">모델 검색</Link>
            <Link to="/Selling" className="menu-item">내차 팔기</Link>
            <Link to="/Buying" className="menu-item">내차 사기</Link>
            <Link to="/price-search" className="menu-item">시세 검색</Link>
          </div>
          <div className="user-icon">
            {isAuthenticated ? (
              <div className="user-menu-container">
                <div 
                  className="user-menu-trigger"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <span className="welcome-text">{user?.name}님</span>
                  {showDropdown && (
                    <div className="user-dropdown">
                      <button 
                        onClick={() => navigate('/mypage')} 
                        className="dropdown-item"
                      >
                        내 정보
                      </button>
                      <button 
                        onClick={() => navigate('/mypage/like')} 
                        className="dropdown-item"
                      >
                        좋아요
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="main-user-icon">
                <Link to="/login" className="main-login">로그인</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="like-page-container">
        <h1 className="like-page-title">좋아요 목록</h1>
        
        {likedCars.length === 0 ? (
          <div className="empty-list">
            <p>좋아요한 차량이 없습니다.</p>
            <Link to="/search" className="search-link">차량 검색하러 가기</Link>
          </div>
        ) : (
          <div className="liked-cars-grid">
            {likedCars.map(car => (
              <div key={car.carId} className="car-card">
                <div className="car-image-container">
                  <Link to={`/car/${car.carId}`} className="car-link">
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      className="car-image"
                    />
                  </Link>
                  <button 
                    className="like-button active"
                    onClick={() => handleLikeClick(car.carId)}
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
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index)}
                className={`page-number ${currentPage === index ? 'active' : ''}`}
              >
                {index + 1}
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
