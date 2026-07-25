import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MerchantApp from './pages/MerchantApp';
import CustomerApp from './pages/CustomerApp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MerchantApp />} />
        <Route path="/pesan" element={<CustomerApp />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
