// Middleware d'erreurs centralisé : toutes les erreurs (ApiError ou autres) transitent
// ici via next(err). Format de réponse uniforme pour que le frontend puisse toujours
// s'attendre à la même structure { success: false, message, details }.

const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Erreur de validation Mongoose (champ requis manquant, format invalide, etc.)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(' '), details: null });
  }

  // Doublon sur un champ "unique" (ex: email déjà utilisé)
  if (err.code === 11000) {
    const champ = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      success: false,
      message: `La valeur fournie pour "${champ}" existe déjà.`,
      details: null,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
    details: null,
  });
}

module.exports = errorHandler;
