// Middleware factory : authorize('admin', 'professeur') renvoie un middleware qui vérifie
// que req.user.role (déjà attaché par auth.middleware.js) fait partie des rôles autorisés.
// À utiliser toujours APRÈS verifyToken dans la chaîne de middlewares d'une route.

const ApiError = require('../utils/ApiError');

function authorize(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!rolesAutorises.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Cette action est réservée à : ${rolesAutorises.join(', ')}.`
      );
    }
    next();
  };
}

module.exports = authorize;
