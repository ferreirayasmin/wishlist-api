// src/main.jsx
// APAGUE TUDO E COLE ESTE CÓDIGO CORRETO

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa os CSS globais
import './index.css';
import './App.css'; // (Este arquivo nem é mais usado, pode apagar depois)

// 1. Importa TODAS as nossas páginas
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import PaginaPublica from './pages/PaginaPublica.jsx'; // A rota pública

// 2. Importa os componentes da área logada
import ProtectedRoute from './auth/ProtectedRoute.jsx'; // O "Segurança"
import MainLayout from './components/MainLayout.jsx';   // O Header cinza
import Dashboard from './pages/Dashboard.jsx';         // A tela de "Minhas Listas"
import ListaDetalhes from './pages/ListaDetalhes.jsx'; // A tela de "Itens"

// 3. Define o "Mapa" COMPLETO
const router = createBrowserRouter([
  
  // == Rotas Públicas (Não precisam de login) ==
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/public/:hash', // A que acabamos de criar
    element: <PaginaPublica />,
  },

  // == Rotas Protegidas (SÓ para quem está logado) ==
  {
    path: '/', // A URL "raiz" (ex: http://localhost:5173/)
    element: <ProtectedRoute />, // 1. O "Segurança" fica na porta
    children: [
      // 2. Se o segurança deixar passar, carrega o Layout Principal...
      {
        element: <MainLayout />, 
        children: [
          // 3. ...e mostra a página certa dentro do Layout
          
          {
            path: '/', // Na rota raiz, mostra o Dashboard
            element: <Dashboard />,
          },
          {
            path: '/listas/:id', // Na rota /listas/1, 2, 11, etc.
            element: <ListaDetalhes />, // Mostra a página de Detalhes/Itens
          },
        ],
      },
    ],
  },
]);

// 4. Inicia o app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);