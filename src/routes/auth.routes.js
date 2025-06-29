// CIMOL-LockerHub/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { handleRegister } = require("../controllers/auth.controller");

// @route   POST /api/auth/register
// @desc    Registra um novo usuário
// @access  Public
router.post("/register", handleRegister);

module.exports = router;
