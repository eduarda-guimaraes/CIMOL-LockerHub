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
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Impede acesso via JavaScript no frontend
      secure: process.env.NODE_ENV === 'production', // Use HTTPS em produção
      sameSite: 'strict', // Proteção contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
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

const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies; // Lê o token do cookie
  try {
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Falha na renovação do token.', error: error.message });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleRefreshToken
};
