// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    // 1. Pega o token do cabeçalho 'Authorization'
    // O padrão é enviar "Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    // 2. Verifica se o cabeçalho existe e extrai o token
    // authHeader && authHeader.split(' ')[0] === 'Bearer'
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Se não houver token, barra a entrada
    if (token == null) {
        return res.status(401).json({ error: "Acesso não autorizado. Token não fornecido." });
    }

    // 4. Verifica a validade do token
    try {
        // Usa o segredo para verificar se o token é válido
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Se for válido, anexa os dados do usuário (o payload do token) 
        // na requisição (req) para que a próxima rota possa usá-los.
        req.usuario = payload; // Agora sabemos quem é o usuário (ex: { id: 1, email: ... })

        // 6. Libera a passagem para a rota final
        next();

    } catch (err) {
        // 7. Se o token for inválido (expirado, assinatura errada), barra a entrada
        return res.status(401).json({ error: "Token inválido." });
    }
}

module.exports = authMiddleware;