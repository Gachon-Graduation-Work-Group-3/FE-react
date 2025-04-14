import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './pages/main/MainPage';
import BuyingPage from './BuyingPage';
import SellingPage from './SellingPage';
import SearchPage from './SearchPage';
import PriceSearchPage from './PriceSearchPage';
import Description from './Description';
import LoginPage from './LoginPage';
import { UserProvider } from './context/UserContext';
import UserProfile from './UserProfile';
import ChatRooms from './chatRoomPage';
import LikePage from './LikePage';
import MySaleListPage from './MySaleListPage';
import LoginSuccess from './LoginsSuccess';
import UserContextPage from './UserContextPage';
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
            <Route path="/user-context" element={<UserContextPage />} />
          </Routes>
      </div>
    </UserProvider>
    </Router>
  );
}

export default App;
