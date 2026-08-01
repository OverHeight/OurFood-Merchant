import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MerchantApp from './pages/MerchantApp';
import CustomerApp from './pages/CustomerApp';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Merchant Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MerchantApp />
            </ProtectedRoute>
          }
        />

        {/* Public Customer Ordering App */}
        <Route path="/pesan" element={<CustomerApp />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
