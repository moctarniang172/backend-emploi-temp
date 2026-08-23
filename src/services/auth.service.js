// Logique métier de l'authentification : vérification des identifiants, génération du JWT,
// changement de mot de passe. Le contrôleur auth.controller.js ne fait qu'appeler ces fonctions.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

function genererToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function login(email, password) {
  if (!email || !password) {
    throw ApiError.badRequest('Email et mot de passe requis.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.actif) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect.');
  }

  const motDePasseValide = await user.comparePassword(password);
  if (!motDePasseValide) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect.');
  }

  user.derniereConnexion = new Date();
  await user.save();

  const token = genererToken(user);

  return {
    token,
    user: {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      refProfesseur: user.refProfesseur,
      refClasse: user.refClasse,
    },
  };
}

async function changePassword(userId, ancienMotDePasse, nouveauMotDePasse) {
  if (!ancienMotDePasse || !nouveauMotDePasse) {
    throw ApiError.badRequest('Ancien et nouveau mot de passe requis.');
  }

  const user = await User.findById(userId).select('+password');
  const motDePasseValide = await user.comparePassword(ancienMotDePasse);
  if (!motDePasseValide) {
    throw ApiError.badRequest("L'ancien mot de passe est incorrect.");
  }

  user.password = nouveauMotDePasse; // sera re-haché par le hook pre('save') du modèle
  await user.save();
}

module.exports = { login, changePassword };
