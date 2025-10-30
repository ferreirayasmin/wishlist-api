// src/pages/PaginaPublica.jsx
// APAGUE TUDO E COLE ISTO

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PaginaPublica.css'; // Importa o CSS
import './ListaDetalhes.css'; // Reutiliza o CSS .item-nome-link

function PaginaPublica() {
  const [lista, setLista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pega o :hash da URL (ex: /public/a1b2c3d4...)
  const { hash } = useParams();

  useEffect(() => {
    if (!hash) return; // Não faz nada se não houver hash

    const fetchListaPublica = async () => {
      try {
        // CHAMA A ROTA PÚBLICA (NÃO PRECISA DE TOKEN)
        const resposta = await axios.get(`http://localhost:8080/public/listas/${hash}`);
        setLista(resposta.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar lista pública:', err);
        setError('Lista não encontrada ou indisponível.');
        setLoading(false);
      }
    };

    fetchListaPublica();
  }, [hash]); // Roda a busca quando o 'hash' for pego

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!lista) return <p>Lista não encontrada.</p>;

  // Esta é a sua "Tela 4" do Figma
  return (
    <>
      <header className="public-header">
        <div className="logo">Minha Wishlist</div>
      </header>
      
      <div className="public-container public-content">
        <h1>{lista.titulo}</h1>
        <p>{lista.descricao || 'Sem descrição.'}</p>
        
        <h2>Itens na Lista</h2>
        {lista.itens.length === 0 ? (
          <p>Nenhum item nesta lista ainda.</p>
        ) : (
          lista.itens.map(item => (
            <div key={item.nome_produto} className="public-item-linha">
              <input 
                type="checkbox" 
                checked={item.comprado} 
                readOnly // Só leitura!
              />
              <div className="item-nome-link">
                <span className="item-nome">{item.nome_produto}</span>
                {item.link_loja && (
                  <a 
                    href={item.link_loja} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="item-link"
                  >
                    Ver na Loja ↗
                  </a>
                )}
              </div>
              <span className="item-preco">
                {item.preco_estimado ? `R$ ${item.preco_estimado}` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PaginaPublica;