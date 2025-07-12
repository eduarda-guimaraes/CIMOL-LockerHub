// src/middlewares/authorize.js

/**
 * Middleware de autorização baseado em perfis (roles).
 * @param {string[]} allowedRoles - Um array de perfis permitidos para a rota. Ex: ['admin'] ou ['admin', 'coordinator']
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Não autorizado. Informações de usuário ausentes.' });
    }

    const { role } = req.user;

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso Proibido. Você não tem permissão para acessar este recurso.' });
  };
};

module.exports = authorize;