// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate'); // Já existe
const authorize = require('../middlewares/authorize');     // O que você acabou de criar
const { handleListUsers } = require('../controllers/user.controller');

router.get('/', authenticate, authorize(['admin']), handleListUsers);

module.exports = router;