// src/pages/Registro.jsx
// COLE ESTE CÓDIGO INTEIRO

import React, { useState } from 'react';
import './Registro.css'; // Importa o CSS correto
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importa o Link

function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome || !email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const resposta = await axios.post('http://localhost:8080/auth/register', {
        nome: nome,
        email: email,
        senha: senha,
      });

      console.log('Resposta da API:', resposta.data);
      setSucesso('Usuário criado com sucesso! Você já pode fazer login.');
      
      setNome('');
      setEmail('');
      setSenha('');

    } catch (err) {
      console.error('Erro no registro:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro('Ocorreu um erro ao tentar se registrar.');
      }
    }
  };

  return (
    // Usamos 'register-container-white' para não ter conflito com o Login
    <div className="register-container-white"> 
      
      <h2>Criar sua Conta</h2>
        
      {erro && <p className="error-message">{erro}</p>}
      {sucesso && <p className="success-message">{sucesso}</p>}

      <form className="register-form" onSubmit={handleSubmit}>
        
        <div className="input-group">
          <label htmlFor="nome">Seu Nome</label>
          <input 
            type="text" 
            id="nome" 
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

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
            placeholder="Crie uma senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="register-button">
          Criar Conta
        </button>
      </form>

      <p className="login-link">
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </p>

    </div>
  );
}

export default Registro;