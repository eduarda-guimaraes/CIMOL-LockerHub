// CIMOL-LockerHub/src/controllers/auth.controller.js
const authService = require("../services/auth.service");

const handleRegister = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      user,
    });
  } catch (error) {
    // Erro de validação do Mongoose ou erro de email duplicado
    if (
      error.message.includes("validation failed") ||
      error.message.includes("email já está cadastrado")
    ) {
      // 409 Conflict é mais semântico para recurso duplicado
      const status = error.message.includes("email já está cadastrado")
        ? 409
        : 400;
      return res.status(status).json({ message: error.message });
    }

    console.error("Erro no registro do usuário:", error);
    res
      .status(500)
      .json({ message: "Ocorreu um erro interno ao registrar o usuário." });
  }
};

module.exports = {
  handleRegister,
};
