import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './pages/main/MainPage';
import BuyingPage from './pages/buying/BuyingPage';
import SellingPage from './pages/selling/SellingPage';
import SearchPage from './pages/search/SearchPage';
import PriceSearchPage from './pages/search/PriceSearchPage';
import Description from './pages/description/Description';
import LoginPage from './pages/user/LoginPage';
import { UserProvider } from './context/UserContext';
import UserProfile from './pages/user/UserProfile';
import ChatRooms from './pages/user/chatRoomPage';
import LikePage from './pages/user/LikePage';
import MySaleListPage from './pages/user/MySaleListPage';
import LoginSuccess from './pages/user/LoginsSuccess';
import SaleBuyingPage from './pages/sale/SaleBuyingPage';
import ApiTestPage from './ApiTest';
import SaleDescription from './pages/description/SaleDescription';
import './App.css';


function App() {
  return (
  <Router>
    <UserProvider>
      <div>   
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/buying" element={<BuyingPage />} />
            <Route path="/selling" element={<SellingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/price-search" element={<PriceSearchPage />} />
            <Route path="/price-result" element={<Description />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat-rooms" element={<ChatRooms/>}/>
            <Route path="/description" element={<Description />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/userProfile" element={<UserProfile />} />
            <Route path="/like" element={<LikePage />} />
            <Route path="/my-sale-list" element={<MySaleListPage />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/sale-buying" element={<SaleBuyingPage />} />
            <Route path="/sale-description" element={<SaleDescription />} />
          </Routes>
      </div>
    </UserProvider>
    </Router>
  );
}

export default App;
