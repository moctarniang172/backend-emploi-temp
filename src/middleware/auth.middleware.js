// Vérifie la présence et la validité d'un token JWT dans l'en-tête "Authorization: Bearer <token>".
// Si valide, attache l'utilisateur correspondant à req.user pour que les controllers/middlewares
// suivants (ex: role.middleware.js) puissent l'utiliser.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token manquant. Veuillez vous connecter.');
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw ApiError.unauthorized('Token invalide ou expiré. Veuillez vous reconnecter.');
  }

  const user = await User.findById(payload.id);
  if (!user || !user.actif) {
    throw ApiError.unauthorized('Compte introuvable ou désactivé.');
  }

  req.user = user;
  next();
});

module.exports = verifyToken;
