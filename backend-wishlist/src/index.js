// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./supabaseClient'); 

// === IMPORTAR ROTAS ===
const authRoutes = require('./routes/authRoutes');
const listasRoutes = require('./routes/listasRoutes');
const itensRoutes = require('./routes/itensRoutes'); // (NOVO)

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
app.use('/auth', authRoutes);
app.use('/listas', listasRoutes);
app.use('/itens', itensRoutes); // (NOVO)

// (Aqui virá o endpoint público...)

// === Iniciar Servidor ===
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});