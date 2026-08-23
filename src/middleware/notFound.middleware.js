// Intercepte toute requête vers une route qui n'existe pas dans l'API,
// pour renvoyer une erreur 404 propre plutôt que la page HTML par défaut d'Express.

const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
