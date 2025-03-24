import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import BuyingPage from './BuyingPage';
import SellingPage from './SellingPage';
import SearchPage from './SearchPage';
import PriceSearchPage from './PriceSearchPage';
import Description from './Description';
import LoginPage from './LoginPage';
import ChatWidget from './components/ChatWidget';
import { UserProvider } from './context/UserContext';
import MyPage from './MyPage';
import ChatRooms from './chatRoomPage';
import './App.css';


function App() {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/buying" element={<BuyingPage />} />
            <Route path="/selling" element={<SellingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/price-search" element={<PriceSearchPage />} />
            <Route path="/price-result" element={<Description />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat-rooms" element={<ChatRooms/>}/>
            <Route path="/description" element={
              <>
                <Description />
              </>
            } />
            <Route path="/login-success" element={<Navigate to="/" replace />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </Router>
      </div>
    </UserProvider>
  );
}

export default App;
