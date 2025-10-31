// src/index.js
// APAGUE TUDO E COLE ESTE CÓDIGO COMPLETO

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./supabaseClient'); 

// === IMPORTAR TODAS AS ROTAS ===
const authRoutes = require('./routes/authRoutes');
const listasRoutes = require('./routes/listasRoutes');
const itensRoutes = require('./routes/itensRoutes');
const publicRoutes = require('./routes/publicRoutes'); // (A ROTA PÚBLICA)

const app = express();
const PORT = process.env.PORT || 8080;

// === Middlewares ===
app.use(cors()); 
app.use(express.json());

// === Rotas ===

app.get('/', (req, res) => {
    res.json({ message: "API Wishlist está funcionando!" });
});

// === USAR ROTAS ===

// (A LINHA QUE FALTAVA)
// Diz ao Express: "Qualquer rota que começar com /public, 
// mande para o arquivo 'publicRoutes'"
app.use('/public', publicRoutes);

// Rotas Privadas (Usam auth)
app.use('/auth', authRoutes);
app.use('/listas', listasRoutes);
app.use('/itens', itensRoutes);

// === Iniciar Servidor ===
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});