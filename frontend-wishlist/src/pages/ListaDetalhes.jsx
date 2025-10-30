// src/pages/ListaDetalhes.jsx
// APAGUE TUDO E COLE ESTE CÓDIGO CORRIGIDO

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';
import './ListaDetalhes.css'; 

function ListaDetalhes() {
  const [lista, setLista] = useState(null); 
  const [itens, setItens] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados do formulário "Adicionar Item"
  const [nomeProduto, setNomeProduto] = useState('');
  const [linkLoja, setLinkLoja] = useState('');
  const [preco, setPreco] = useState('');

  // Estados do formulário "Editar Item"
  const [editingItemId, setEditingItemId] = useState(null); 
  const [editNome, setEditNome] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editPreco, setEditPreco] = useState('');

  const { id } = useParams(); 

  // --- FUNÇÕES DE API (Todas as funções de antes) ---
  // (Fetch, Adicionar, Excluir, Checkbox)
  
  const fetchListaDetalhes = async () => {
    try {
      const token = localStorage.getItem('meu-token-jwt');
      if (!token) throw new Error('Token não encontrado.');
      const resposta = await axios.get(`http://localhost:8080/listas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLista(resposta.data); 
      setItens(resposta.data.itens || []); 
      setLoading(false);
    } catch (err) {
      setError('Não foi possível carregar os dados da lista.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListaDetalhes();
  }, [id]); 
  
  const handleAdicionarItem = async (evento) => {
    evento.preventDefault();
    if (!nomeProduto) return alert('O nome do produto é obrigatório.');
    try {
      const token = localStorage.getItem('meu-token-jwt');
      const precoParaEnviar = preco ? Number(preco) : null;
      const resposta = await axios.post('http://localhost:8080/itens', 
        {
          nome_produto: nomeProduto,
          link_loja: linkLoja,
          preco_estimado: precoParaEnviar,
          lista_id: Number(id), 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItens([...itens, resposta.data]);
      setNomeProduto(''); setLinkLoja(''); setPreco('');
    } catch (err) {
      alert('Não foi possível adicionar o item.');
    }
  };

  const handleExcluirItem = async (itemId) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      const token = localStorage.getItem('meu-token-jwt');
      await axios.delete(`http://localhost:8080/itens/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItens(itens.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Não foi possível excluir o item.');
    }
  };

  const handleToggleComprado = async (item) => {
    const novoEstadoComprado = !item.comprado;
    setItens(itens.map(i => i.id === item.id ? { ...i, comprado: novoEstadoComprado } : i));
    try {
      const token = localStorage.getItem('meu-token-jwt');
      await axios.patch(`http://localhost:8080/itens/${item.id}`, 
        { comprado: novoEstadoComprado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert('Não foi possível atualizar o item. Revertendo.');
      setItens(itens.map(i => i.id === item.id ? { ...i, comprado: item.comprado } : i));
    }
  };
  
  // --- LÓGICA DE EDIÇÃO (Corrigida) ---

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setEditNome(item.nome_produto);
    setEditLink(item.link_loja || '');
    setEditPreco(item.preco_estimado || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null); 
  };

  const handleSaveEdit = async (itemId) => {
    if (!editNome) return alert('O nome do produto é obrigatório.');
    try {
      const token = localStorage.getItem('meu-token-jwt');
      const resposta = await axios.put(`http://localhost:8080/itens/${itemId}`, 
        {
          nome_produto: editNome,
          link_loja: editLink || null, 
          preco_estimado: editPreco ? Number(editPreco) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItens(itens.map(i => i.id === itemId ? resposta.data : i));
      handleCancelEdit();
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      alert('Não foi possível salvar as alterações.');
    }
  };

  // --- O RESTO DO JSX (COM O CAMPO DE LINK) ---

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!lista) return <p>Lista não encontrada.</p>;

  return (
    <div className="detalhes-container">
      
      {/* ... (Header e Formulário de Adicionar, iguais a antes) ... */}
      <div className="detalhes-header">
        <h1>{lista.titulo}</h1>
        <p>{lista.descricao || 'Sem descrição.'}</p>
        <div className="link-publico">
          <span>{`http://localhost:5173/public/${lista.link_publico_hash}`}</span>
          <button onClick={() => navigator.clipboard.writeText(`http://localhost:5173/public/${lista.link_publico_hash}`)}>
            Copiar Link
          </button>
        </div>
      </div>
      <div className="add-item-container">
        <h3>Adicionar Novo Item</h3>
        <form className="add-item-form" onSubmit={handleAdicionarItem}>
          <div className="input-group"><label htmlFor="nome_produto">Nome do Produto</label><input id="nome_produto" type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)}/></div>
          <div className="input-group"><label htmlFor="link_loja">Link (Opcional)</label><input id="link_loja" type="text" value={linkLoja} onChange={(e) => setLinkLoja(e.target.value)}/></div>
          <div className="input-group"><label htmlFor="preco">Preço (Opcional)</label><input id="preco" type="number" value={preco} onChange={(e) => setPreco(e.target.value)}/></div>
          <button type="submit">+ Adicionar</button>
        </form>
      </div>
      {/* ... Fim do Header e Formulário ... */}


      <div className="itens-list-container">
        <h2>Itens na Lista</h2>
        {itens.length === 0 ? (
          <p>Nenhum item adicionado ainda.</p>
        ) : (
          itens.map(item => (
            
            editingItemId !== item.id ? (
              
              // ==========================================================
              // == (NOVO) MODO VISUALIZAÇÃO (COM O LINK) ==
              // ==========================================================
              <div key={item.id} className="item-linha">
                <input 
                  type="checkbox" 
                  checked={item.comprado} 
                  onChange={() => handleToggleComprado(item)} 
                />
                
                {/* (NOVO) Este 'div' mostra o nome E o link */}
                <div className="item-nome-link">
                  <span className="item-nome">{item.nome_produto}</span>
                  {/* Se o item.link_loja existir, mostra o link */}
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
                
                <button 
                  className="item-acao-button"
                  onClick={() => handleEditItem(item)} 
                >
                  ✏️
                </button>
                <button 
                  className="item-acao-button" 
                  onClick={() => handleExcluirItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            ) : (
              // 2. MODO EDIÇÃO (Corrigido e completo)
              <div key={item.id} className="item-linha-edit">
                <div className="item-edit-inputs">
                  <input 
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Nome do Produto"
                  />
                  <input 
                    type="text"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="Link da Loja (Opcional)"
                  />
                  <input 
                    type="number"
                    value={editPreco}
                    onChange={(e) => setEditPreco(e.target.value)}
                    placeholder="Preço (Opcional)"
                  />
                </div>
                <div className="item-edit-actions">
                  <button 
                    className="form-button-cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="form-button-save" 
                    onClick={() => handleSaveEdit(item.id)}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>

    </div>
  );
}

export default ListaDetalhes;