// src/routes/publicRoutes.js
// ESTE É O CÓDIGO CORRIGIDO E COMPLETO

const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Endpoint: GET /public/listas/:hash
// O que faz: Busca uma lista e seus itens pelo hash público
router.get('/listas/:hash', async (req, res) => {
    // 1. Pega o hash da URL
    const hash = req.params.hash;

    try {
        // 2. Busca no Supabase
        const { data, error } = await supabase
            .from('listas')
            .select(`
                titulo,
                descricao,
                itens (
                    nome_produto,
                    link_loja,
                    preco_estimado,
                    imagem_url,
                    comprado
                )
            `)
            .eq('link_publico_hash', hash) // Onde o hash for o da URL
            .single(); // Espera apenas um resultado

        // 3. Se o Supabase retornar um erro (ex: falha de conexão)
        if (error) {
            throw error;
        }
        
        // 4. Se a lista não for encontrada (o hash não existe)
        if (!data) {
            return res.status(404).json({ error: "Lista não encontrada." });
        }

        // 5. Se deu tudo certo, formata e envia a lista
        const listaPublica = {
            titulo: data.titulo,
            descricao: data.descricao,
            itens: data.itens
        };
        res.status(200).json(listaPublica);

    } catch (err) {
        // 6. Se qualquer outra coisa quebrar
        console.error("Erro no publicRoutes:", err.message);
        res.status(500).json({ error: "Erro ao buscar a lista." });
    }
});

module.exports = router;