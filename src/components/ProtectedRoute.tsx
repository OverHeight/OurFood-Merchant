import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const merchantId = localStorage.getItem('merchantId');

  if (!merchantId) {
    // Redirect to login page if no merchant is selected / authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
