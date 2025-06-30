// CIMOL-LockerHub/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { handleRegister, handleLogin } = require("../controllers/auth.controller");

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
// @access  Public
router.post("/register", handleRegister);

// @route   POST /api/auth/login
// @desc    Login de um usuário e retorno do token
// @access  Public
router.post("/login", handleLogin);

module.exports = router;