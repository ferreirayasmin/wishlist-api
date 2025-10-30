// src/pages/Dashboard.jsx
// APAGUE TUDO E COLE ESTE CÓDIGO ATUALIZADO

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // (NOVO) ADICIONE ESTA LINHA
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados do formulário de CRIAÇÃO
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  // (NOVO) Estados do formulário de EDIÇÃO
  // Guarda o ID da lista que está sendo editada (null = nenhuma)
  const [editingId, setEditingId] = useState(null); 
  // Guarda o texto do título da lista sendo editada
  const [editTitulo, setEditTitulo] = useState(''); 
  // Guarda o texto da descrição da lista sendo editada
  const [editDescricao, setEditDescricao] = useState(''); 

  // ----- Funções de API (Fetch, Delete, Create) -----
  // (São as mesmas que você já tinha)

  const fetchListas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('meu-token-jwt');
      if (!token) throw new Error('Token não encontrado.');
      const resposta = await axios.get('http://localhost:8080/listas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListas(resposta.data);
      setLoading(false);
    } catch (err) {
      setError('Não foi possível carregar suas listas.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListas();
  }, []);

  const handleDelete = async (listaId) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta lista?');
    if (!confirmar) return;
    try {
      const token = localStorage.getItem('meu-token-jwt');
      if (!token) throw new Error('Token não encontrado.');
      await axios.delete(`http://localhost:8080/listas/${listaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListas(listas.filter((lista) => lista.id !== listaId));
    } catch (err) {
      alert('Não foi possível excluir a lista.');
    }
  };

  const handleShowCreateForm = () => setShowCreateForm(true);

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNovoTitulo('');
    setNovaDescricao('');
  };

  const handleSaveCreate = async (evento) => {
    evento.preventDefault();
    if (!novoTitulo) return alert('O título é obrigatório.');
    try {
      const token = localStorage.getItem('meu-token-jwt');
      const resposta = await axios.post('http://localhost:8080/listas', 
        { titulo: novoTitulo, descricao: novaDescricao },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListas([...listas, resposta.data]);
      handleCancelCreate();
    } catch (err) {
      alert('Não foi possível criar a lista.');
    }
  };
  
  // ==========================================================
  // == NOVO CÓDIGO: LÓGICA DE EDITAR LISTA ==
  // ==========================================================
  
  // (NOVO) Chamado quando o botão "Editar" é clicado
  const handleEdit = (lista) => {
    setEditingId(lista.id); // Define qual card está em modo de edição
    setEditTitulo(lista.titulo); // Preenche o input com o título atual
    setEditDescricao(lista.descricao || ''); // Preenche o input com a descrição atual
  };

  // (NOVO) Chamado quando o botão "Cancelar" (da edição) é clicado
  const handleCancelEdit = () => {
    setEditingId(null); // Sai do modo de edição
    setEditTitulo('');
    setEditDescricao('');
  };

  // (NOVO) Chamado quando o botão "Salvar" (da edição) é clicado
  const handleSaveEdit = async (listaId) => {
    if (!editTitulo) {
      alert('O título é obrigatório.');
      return;
    }
    
    try {
      const token = localStorage.getItem('meu-token-jwt');
      
      // 1. CHAMA A API DE ATUALIZAÇÃO (PUT)
      const resposta = await axios.put(`http://localhost:8080/listas/${listaId}`,
        {
          titulo: editTitulo,
          descricao: editDescricao,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 2. (SUCESSO!) Atualiza a tela:
      // Mapeia as listas antigas. Se o ID for o que editamos, troca pela nova (resposta.data)
      setListas(listas.map((lista) => 
        lista.id === listaId ? resposta.data : lista
      ));

      // 3. Sai do modo de edição
      handleCancelEdit();

    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      alert('Não foi possível salvar as alterações.');
    }
  };
  // ==========================================================
  // == FIM DO NOVO CÓDIGO ==
  // ==========================================================


  // O JSX (HTML) agora tem uma lógica condicional (if/else)
  return (
    <div className="dashboard-container">
      
      {/* Formulário de CRIAÇÃO (igual ao de antes) */}
      {!showCreateForm && (
        <button className="create-list-button" onClick={handleShowCreateForm}>
          + Criar Nova Lista
        </button>
      )}
      {showCreateForm && (
        <div className="create-form-container">
          <h3>Nova Lista de Desejos</h3>
          <form className="create-form" onSubmit={handleSaveCreate}>
            {/* ... (inputs e botões de criação, igual ao de antes) ... */}
            <div className="input-group">
              <label htmlFor="titulo">Título</label>
              <input id="titulo" type="text" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Ex: Livros para Ler" />
            </div>
            <div className="input-group">
              <label htmlFor="descricao">Descrição (Opcional)</label>
              <textarea id="descricao" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex: Meus próximos livros de ficção" />
            </div>
            <div className="create-form-actions">
              <button type="button" className="form-button form-button-cancel" onClick={handleCancelCreate}>Cancelar</button>
              <button type="submit" className="form-button form-button-save">Salvar Lista</button>
            </div>
          </form>
        </div>
      )}

      <h2>Minhas Listas</h2>
      {loading && <p>Carregando listas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* (NOVO) Lógica de renderização dos cards */}
      <div className="list-grid-container">
        
        {listas.map((lista) => (
          <div key={lista.id} className="list-card">
            
            {/* Se esta lista NÃO ESTÁ sendo editada (editingId !== lista.id) */}
            {editingId !== lista.id ? (
              
              // 1. Mostra o card normal
              <>
                <div className="list-card-header">
                    <Link to={`/listas/${lista.id}`}>
                    <h3>{lista.titulo}</h3>
                    </Link>
                </div>  
                <div className="list-card-body">
                  <p>{lista.descricao || 'Sem descrição'}</p>
                </div>
                <div className="list-card-actions">
                  <button className="card-button">Comp</button>
                  <button 
                    className="card-button" 
                    onClick={() => handleEdit(lista)}
                  >
                    Editar
                  </button>
                  <button 
                    className="card-button"
                    onClick={() => handleDelete(lista.id)}
                  >
                    Excluir
                  </button>
                </div>
              </>
              
            ) : (

              // 2. (NOVO) Mostra o formulário de EDIÇÃO
              <div className="list-card-edit-form">
                <input 
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                />
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                />
                <div className="list-card-actions">
                  <button 
                    className="card-button"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="card-button"
                    onClick={() => handleSaveEdit(lista.id)}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;