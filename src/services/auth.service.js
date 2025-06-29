// CIMOL-LockerHub/src/services/auth.service.js
const User = require("../models/User.model");

/**
 * Registra um novo usuário no banco de dados.
 * @param {object} userData - Os dados do usuário (email, password).
 * @returns {Promise<object>} O usuário criado (sem a senha).
 * @throws {Error} Se o email já estiver em uso.
 */
const registerUser = async (userData) => {
  // 1. Verificar se o email já existe
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    // Lançar um erro que será capturado pelo controller
    throw new Error("Este email já está cadastrado.");
  }

  // 2. Regra: O primeiro usuário registrado no sistema será um 'admin'
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    userData.role = "admin";
    console.log(
      `Primeiro usuário detectado. Registrando ${userData.email} como administrador.`
    );
  }

  // 3. Criar e salvar o novo usuário (o hook 'pre-save' irá hashear a senha)
  const newUser = new User(userData);
  await newUser.save();

  // 4. Garantir que a senha não seja retornada na resposta final
  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject;
};

module.exports = {
  registerUser,
};
