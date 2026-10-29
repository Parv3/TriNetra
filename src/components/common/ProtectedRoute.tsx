import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  children: React.ReactNode;
  /** require OTP/Google login only (not face) */
  requireAuth?: boolean;
  /** require face verification too */
  requireFace?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  requireAuth = true,
  requireFace = false,
}) => {
  const { user, isOtpVerified, isFaceVerified } = useAuthStore();

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAuth && !isOtpVerified) {
    return <Navigate to="/login" replace />;
  }

  if (requireFace && !isFaceVerified) {
    return <Navigate to="/face-verification" replace />;
  }

  return <>{children}</>;
};
