// Gère uniquement la partie HTTP de l'authentification (lecture de la requête, envoi de la
// réponse). Toute la logique métier vit dans services/auth.service.js.

const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const resultat = await authService.login(email, password);
  sendSuccess(res, 200, 'Connexion réussie.', resultat);
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Profil récupéré.', { user: req.user });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  await authService.changePassword(req.user._id, ancienMotDePasse, nouveauMotDePasse);
  sendSuccess(res, 200, 'Mot de passe modifié avec succès.');
});

module.exports = { login, getMe, changePassword };
