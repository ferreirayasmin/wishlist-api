// src/pages/Login.jsx
// APAGUE TUDO E COLE ISTO

import React, { useState } from 'react';
// 1. Importa o Link E o useNavigate
import { Link, useNavigate } from 'react-router-dom'; 
import './Login.css';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  // 2. Pega a função de navegação
  const navigate = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault(); 
    setErro(''); 

    if (!email || !senha) {
      setErro('Por favor, preencha o email e a senha.');
      return;
    }

    try {
      const resposta = await axios.post('http://localhost:8080/auth/login', {
        email: email,
        senha: senha,
      });

      const token = resposta.data.token;
      localStorage.setItem('meu-token-jwt', token);

      // 3. EM VEZ DE ALERT, NAVEGA PARA A ROTA '/' (Dashboard)
      navigate('/');

    } catch (err) {
      console.error('Erro no login:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro('Ocorreu um erro ao tentar fazer login.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar na Wishlist</h2>
        
        {erro && <p className="error-message">{erro}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha" 
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)} 
            />
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <p className="register-link">
          Ainda não tem conta? <Link to="/registro">Registre-se aqui</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;