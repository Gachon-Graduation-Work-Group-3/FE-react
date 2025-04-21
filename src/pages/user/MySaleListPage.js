import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MySaleListPage.css';

function MySaleListPage() {
  const [saleList, setSaleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchMySaleList();
  }, []);

  const fetchMySaleList = async () => {
    try {
      const response = await fetch('https://rakunko.store/api/car/sale/my', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('판매 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setSaleList(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-sale-list-container">
      <h1>내 판매 차량</h1>
      <div className="sale-list">
        {saleList.map((car) => (
          <div key={car.carId} className="car-card">
            <div className="car-image">
              <img src={car.images[0]} alt={car.name} />
              <div className="sale-status">
                {car.status === 'SALE' ? '판매중' : '판매완료'}
              </div>
            </div>
            <div className="car-info">
              <h3>{car.name}</h3>
              <p className="car-price">{car.price.toLocaleString()}원</p>
              <p className="car-details">
                {car.year} · {car.mileage.toLocaleString()}km
              </p>
              <div className="action-buttons">
                <Link 
                  to={`/car/${car.carId}`} 
                  className="view-button"
                >
                  상세보기
                </Link>
                <button 
                  className="edit-button"
                  onClick={() => navigate(`/car/edit/${car.carId}`)}
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MySaleListPage;