// frontend/src/components/common/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../App';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si aucun rôle spécifié, autoriser tous les utilisateurs authentifiés
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Vérifier si l'utilisateur a le bon rôle
  if (!user || !allowedRoles.includes(user.type)) {
    // Rediriger vers la page appropriée selon le rôle
    const redirectPath = user?.type === 'admin' ? '/admin' : 
                        user?.type === 'superviseur' ? '/superviseur' : 
                        '/electeur';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 