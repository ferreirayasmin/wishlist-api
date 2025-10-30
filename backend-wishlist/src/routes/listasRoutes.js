// src/routes/listasRoutes.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware'); // Nosso "segurança"
const { v4: uuidv4 } = require('uuid'); // Para gerar o hash único

// ==========================================================
// TODAS AS ROTAS AQUI SÃO PROTEGIDAS (PRECISAM DE TOKEN)
// Aplicamos o middleware em todas as rotas deste arquivo
router.use(authMiddleware);
// ==========================================================

// Endpoint: POST /listas
// O que faz: Cria uma nova lista de desejos
router.post('/', async (req, res) => {
    // 1. Pega os dados do corpo (body)
    const { titulo, descricao } = req.body;

    // 2. Pega o ID do usuário que o middleware identificou (do token)
    const usuarioId = req.usuario.id; 

    // 3. Gera o hash único para o link público
    const hash = uuidv4();

    if (!titulo) {
        return res.status(400).json({ error: "O título é obrigatório." });
    }

    try {
        // 4. Insere no Supabase (com o ID do dono e o hash)
        const { data, error } = await supabase
            .from('listas')
            .insert({ 
                usuario_id: usuarioId, 
                titulo, 
                descricao, 
                link_publico_hash: hash 
            })
            .select()
            .single();

        if (error) throw error;
        
        // 5. Responde com a lista criada
        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: GET /listas
// O que faz: Busca todas as listas do usuário logado
router.get('/', async (req, res) => {
    // 1. Pega o ID do usuário logado (do token)
    const usuarioId = req.usuario.id;

    try {
        // 2. Busca no Supabase
        const { data, error } = await supabase
            .from('listas')
            .select('*') // Pega todas as colunas
            .eq('usuario_id', usuarioId); // Onde o 'usuario_id' é o do nosso usuário

        if (error) throw error;
        
        // 3. Responde com os dados
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: GET /listas/:id
// O que faz: Busca UMA lista específica e seus itens
router.get('/:id', async (req, res) => {
    const usuarioId = req.usuario.id;
    const listaId = req.params.id; // Pega o ID da URL

    try {
        // Busca a lista e seus itens (usando a mágica de 'join' do Supabase)
        // 'listas' (id, titulo), 'itens' ( * )
        const { data, error } = await supabase
            .from('listas')
            .select(`
                id,
                titulo,
                descricao,
                link_publico_hash,
                itens ( * ) 
            `)
            .eq('id', listaId) // Filtra pelo ID da lista
            .eq('usuario_id', usuarioId) // Filtra pelo dono (segurança)
            .single(); // Espera apenas um resultado

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: "Lista não encontrada ou não pertence a você." });
        }
        
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: PUT /listas/:id
// O que faz: Atualiza uma lista
router.put('/:id', async (req, res) => {
    const usuarioId = req.usuario.id;
    const listaId = req.params.id;
    const { titulo, descricao } = req.body; // O que o usuário quer atualizar

    if (!titulo) {
        return res.status(400).json({ error: "O título é obrigatório." });
    }

    try {
        const { data, error } = await supabase
            .from('listas')
            .update({ titulo, descricao }) // Atualiza os dados
            .eq('id', listaId) // Onde o ID da lista for este
            .eq('usuario_id', usuarioId) // E o dono for este (segurança)
            .select() // Retorna os dados atualizados
            .single();
        
        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: "Lista não encontrada ou não pertence a você." });
        }
        
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: DELETE /listas/:id
// O que faz: Deleta uma lista
router.delete('/:id', async (req, res) => {
    const usuarioId = req.usuario.id;
    const listaId = req.params.id;

    try {
        const { data, error } = await supabase
            .from('listas')
            .delete()
            .eq('id', listaId)
            .eq('usuario_id', usuarioId) // Segurança
            .select() // Pede para retornar o item deletado
            .single();

        if (error) throw error;

        if (!data) {
            // Isso acontece se o ID não existir ou não pertencer ao usuário
            return res.status(404).json({ error: "Lista não encontrada ou não pertence a você." });
        }

        // Resposta 204 (No Content) é padrão para DELETE bem-sucedido
        res.status(204).send(); 

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;