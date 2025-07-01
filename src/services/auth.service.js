// CIMOL-LockerHub/src/services/auth.service.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Este email já está cadastrado.");
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    userData.role = "admin";
    console.log(
      `Primeiro usuário detectado. Registrando ${userData.email} como administrador.`
    );
  }

  const newUser = new User(userData);
  await newUser.save();

  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error('Senha incorreta');
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET, // Use uma chave secreta armazenada no .env
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET, // Use uma chave secreta para refresh token
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken, user };
};

const refreshAccessToken = async (token) => {
  if (!token) {
    throw new Error('Refresh token não fornecido.');
  }
  // Verifica o refresh token
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  
  // Gera um novo access token
  const newAccessToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { accessToken: newAccessToken };
};


module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken
};
