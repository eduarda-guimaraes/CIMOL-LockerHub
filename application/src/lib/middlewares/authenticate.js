// CIMOL-LockerHub/src/middlewares/authenticate.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação para verificar se o usuário possui um token válido.
 * @param {object} req - A requisição (onde procuramos pelo token).
 * @param {object} res - A resposta (onde retornamos um erro caso o token não seja válido).
 * @param {function} next - Função para passar o controle para o próximo middleware.
 */
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use a chave secreta do .env
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authenticate;