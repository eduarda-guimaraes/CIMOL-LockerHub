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
    if (
      error.message.includes("validation failed") ||
      error.message.includes("email já está cadastrado")
    ) {
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

// Função para login
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);
    res.status(200).json({
      message: 'Login bem-sucedido!',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Erro no login do usuário:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleRegister,
  handleLogin
};
