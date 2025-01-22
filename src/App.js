import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import BuyingPage from './BuyingPage';
import SellingPage from './SellingPage';
import SearchPage from './SearchPage';
import PriceSearchPage from './PriceSearchPage';
import Description from './Description';
import LoginPage from './LoginPage';
import ChatWidget from './components/ChatWidget';
import './App.css';


function App() {
  return (
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
          <Route path="/description" element={<Description />} />
        </Routes>
      </Router>
      <ChatWidget />
    </div>
  );
}

export default App;
