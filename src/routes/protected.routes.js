// CIMOL-LockerHub/src/routes/protected.routes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

// Rota protegida: exemplo de perfil do usuário
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    message: "Perfil do usuário",
    user: req.user // Aqui você acessa os dados do usuário autenticado
  });
});

module.exports = router;
