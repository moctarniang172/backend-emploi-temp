// Logique métier de la gestion des comptes utilisateurs (réservée à l'admin).

const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function listUsers() {
  return User.find().populate('refProfesseur refClasse').sort({ createdAt: -1 });
}

async function createUser({ nom, prenom, email, password, role, refProfesseur, refClasse }) {
  const user = await User.create({ nom, prenom, email, password, role, refProfesseur, refClasse });
  const userSansMotDePasse = user.toObject();
  delete userSansMotDePasse.password;
  return userSansMotDePasse;
}

async function updateUser(id, { nom, prenom, email, role, refProfesseur, refClasse, actif }) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('Compte introuvable.');

  if (nom !== undefined) user.nom = nom;
  if (prenom !== undefined) user.prenom = prenom;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (refProfesseur !== undefined) user.refProfesseur = refProfesseur;
  if (refClasse !== undefined) user.refClasse = refClasse;
  if (actif !== undefined) user.actif = actif;

  await user.save();
  return user;
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('Compte introuvable.');
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
