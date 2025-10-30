// src/routes/itensRoutes.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================================
// TODAS AS ROTAS AQUI SÃO PROTEGIDAS (PRECISAM DE TOKEN)
router.use(authMiddleware);
// ==========================================================

// Função auxiliar para checar se o usuário é dono da lista
// (Vamos usar isso em PUT, PATCH, DELETE)
async function checarDonoDaListaPorItem(itemId, usuarioId) {
    // 1. Acha o item
    const { data: item, error: itemError } = await supabase
        .from('itens')
        .select('lista_id')
        .eq('id', itemId)
        .single();
    
    if (itemError || !item) return { error: "Item não encontrado." };

    // 2. Acha a lista do item
    const { data: lista, error: listaError } = await supabase
        .from('listas')
        .select('usuario_id')
        .eq('id', item.lista_id)
        .single();

    if (listaError || !lista) return { error: "Lista não encontrada." };

    // 3. Compara o ID do dono da lista com o ID do usuário do token
    if (lista.usuario_id !== usuarioId) {
        return { error: "Acesso negado. Você não é o dono desta lista." };
    }

    // Se chegou aqui, o usuário é o dono.
    return { success: true, lista_id: item.lista_id };
}


// Endpoint: POST /itens
// O que faz: Adiciona um novo item a uma lista
router.post('/', async (req, res) => {
    // 1. Pega os dados do body
    const { nome_produto, link_loja, preco_estimado, imagem_url, lista_id } = req.body;
    
    // 2. Pega o ID do usuário (do token)
    const usuarioId = req.usuario.id;

    if (!nome_produto || !lista_id) {
        return res.status(400).json({ error: "Nome do produto e lista_id são obrigatórios." });
    }

    try {
        // 3. VERIFICAÇÃO DE SEGURANÇA: O usuário é dono da lista onde quer adicionar?
        const { data: lista, error: listaError } = await supabase
            .from('listas')
            .select('id')
            .eq('id', lista_id)
            .eq('usuario_id', usuarioId) // Checa o dono
            .single();

        if (listaError || !lista) {
            return res.status(403).json({ error: "Acesso negado. Você não pode adicionar itens a esta lista." });
        }
        
        // 4. Se for o dono, insere o item
        const { data: novoItem, error: insertError } = await supabase
            .from('itens')
            .insert({
                lista_id,
                nome_produto,
                link_loja,
                preco_estimado,
                imagem_url
            })
            .select()
            .single();
        
        if (insertError) throw insertError;

        res.status(201).json(novoItem);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Endpoint: PUT /itens/:id
// O que faz: Atualiza TODOS os dados de um item
router.put('/:id', async (req, res) => {
    const itemId = req.params.id;
    const usuarioId = req.usuario.id;
    const { nome_produto, link_loja, preco_estimado, imagem_url, comprado } = req.body;

    if (!nome_produto) {
        return res.status(400).json({ error: "Nome do produto é obrigatório." });
    }

    try {
        // 1. VERIFICAÇÃO DE SEGURANÇA (usando nossa função)
        const check = await checarDonoDaListaPorItem(itemId, usuarioId);
        if (check.error) {
            // Retorna 403 (Proibido) ou 404 (Não encontrado)
            return res.status(check.error.includes("Acesso negado") ? 403 : 404).json(check);
        }

        // 2. Se for o dono, atualiza
        const { data, error } = await supabase
            .from('itens')
            .update({
                nome_produto,
                link_loja,
                preco_estimado,
                imagem_url,
                comprado
            })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: PATCH /itens/:id
// O que faz: Atualiza parcialmente (ex: marcar como 'comprado')
router.patch('/:id', async (req, res) => {
    const itemId = req.params.id;
    const usuarioId = req.usuario.id;
    const { comprado } = req.body; // Pega só o dado 'comprado'

    if (typeof comprado !== 'boolean') {
        return res.status(400).json({ error: "O campo 'comprado' deve ser true ou false." });
    }

    try {
        // 1. VERIFICAÇÃO DE SEGURANÇA
        const check = await checarDonoDaListaPorItem(itemId, usuarioId);
        if (check.error) {
            return res.status(check.error.includes("Acesso negado") ? 403 : 404).json(check);
        }

        // 2. Atualiza SÓ o campo 'comprado'
        const { data, error } = await supabase
            .from('itens')
            .update({ comprado: comprado })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: DELETE /itens/:id
// O que faz: Deleta um item
router.delete('/:id', async (req, res) => {
    const itemId = req.params.id;
    const usuarioId = req.usuario.id;

    try {
        // 1. VERIFICAÇÃO DE SEGURANÇA
        const check = await checarDonoDaListaPorItem(itemId, usuarioId);
        if (check.error) {
            return res.status(check.error.includes("Acesso negado") ? 403 : 404).json(check);
        }

        // 2. Se for o dono, deleta
        const { error } = await supabase
            .from('itens')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
        
        // 3. Sucesso (Sem conteúdo)
        res.status(204).send();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;