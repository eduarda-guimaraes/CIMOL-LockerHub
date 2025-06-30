// CIMOL-LockerHub/src/app.js
const express = require("express");
const { connectDB } = require("./config/database");
require("dotenv").config();

// Importe suas rotas de autenticação
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Conectar ao banco de dados
connectDB();

app.get("/api", (req, res) => {
  res.send("LockerHub API rodando...");
});

// Use o roteador de autenticação com um prefixo
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes); // Rota protegida

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
