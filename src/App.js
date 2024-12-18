import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import BuyingPage from './BuyingPage';
import SellingPage from './SellingPage';
import SearchPage from './SearchPage';
import PriceSearchPage from './PriceSearchPage';
import PriceResultPage from './PriceResultPage';
import LoginPage from './LoginPage';
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
          <Route path="/price-result" element={<PriceResultPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
