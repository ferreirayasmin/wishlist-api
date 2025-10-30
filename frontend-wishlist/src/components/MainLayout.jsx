// src/components/MainLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './MainLayout.css'; // Vamos criar este CSS

function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Limpa o token do localStorage
    localStorage.removeItem('meu-token-jwt');
    // 2. Envia o usuário de volta para o login
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <header className="main-header">
        <div className="logo">Minha Wishlist</div>
        <div className="user-info">
          <span>Olá, [Nome]</span> {/* Vamos melhorar isso depois */}
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>
      
      <main className="main-content">
        {/* Outlet: Aqui é onde o Dashboard (e outras páginas) irão aparecer */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default MainLayout;