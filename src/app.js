const express = require('express');
const { connectDB } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conectar ao banco de dados
connectDB();

app.get('/', (req, res) => {
  res.send('LockerHub API rodando...');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
