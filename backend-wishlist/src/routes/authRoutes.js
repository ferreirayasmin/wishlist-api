// src/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // "Roteador" do Express para gerenciar endpoints
const supabase = require('../supabaseClient'); // Nosso cliente Supabase
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Endpoint: POST /auth/register
// O que faz: Cria um novo usuário
router.post('/register', async (req, res) => {
    // 1. Pega os dados do corpo da requisição (o JSON enviado)
    const { nome, email, senha } = req.body;

    // 2. Validação (como você planejou!)
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }

    try {
        // 3. Criptografa a senha (Hashing)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 4. Insere no Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .insert({ nome, email, senha: senhaHash })
            .select('id, nome, email') // Retorna os dados inseridos (menos a senha)
            .single(); // Esperamos apenas um resultado

        // 5. Trata erros (ex: email já existe)
        if (error) {
            // O código '23505' é o erro de violação de 'UNIQUE' (email duplicado)
            if (error.code === '23505') {
                return res.status(400).json({ error: "Este email já está em uso." });
            }
            return res.status(500).json({ error: error.message });
        }
        
        // 6. Responde com sucesso
        res.status(201).json({ message: "Usuário criado com sucesso!", usuario: data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: POST /auth/login
// O que faz: Autentica um usuário e retorna um token
router.post('/login', async (req, res) => {
    // 1. Pega os dados
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    try {
        // 2. Busca o usuário pelo email no banco
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('id, nome, email, senha') // Precisamos da senha (hash) para comparar
            .eq('email', email) // 'eq' = equals (igual a)
            .single();

        // 3. Se o usuário não for encontrado
        if (error || !usuario) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // 4. Compara a senha enviada com a senha (hash) salva no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida." });
        }

        // 5. Se a senha estiver correta, gera o Token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, // O que "guardamos" no token
            process.env.JWT_SECRET, // Nosso segredo do .env
            { expiresIn: '8h' } // Tempo de validade do token
        );

        // 6. Remove a senha do objeto antes de enviar a resposta
        delete usuario.senha; 

        // 7. Responde com o token e os dados do usuário
        res.status(200).json({
            message: "Login bem-sucedido!",
            usuario: usuario,
            token: token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router; // Exporta o roteador para o index.js