// src/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Carrega as variáveis do .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL ou Key não estão definidos no .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;