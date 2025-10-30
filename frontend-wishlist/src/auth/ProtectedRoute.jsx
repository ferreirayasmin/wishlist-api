// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // 1. Verifica se o token existe no localStorage
  const token = localStorage.getItem('meu-token-jwt');

  // 2. Se NÃO houver token, redireciona para a página de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se HOUVER token, permite o acesso à rota (renderiza o Outlet)
  return <Outlet />;
}

export default ProtectedRoute;