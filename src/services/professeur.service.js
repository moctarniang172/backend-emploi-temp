// Logique métier du CRUD des professeurs et de la gestion de leurs disponibilités.

const Professeur = require('../models/Professeur');
const ApiError = require('../utils/ApiError');

async function listProfesseurs() {
  return Professeur.find().populate('matieresEnseignees').sort({ nom: 1 });
}

async function getProfesseur(id) {
  const professeur = await Professeur.findById(id).populate('matieresEnseignees');
  if (!professeur) throw ApiError.notFound('Professeur introuvable.');
  return professeur;
}

async function createProfesseur({ nom, prenom, email, telephone, matieresEnseignees, disponibilites }) {
  return Professeur.create({ nom, prenom, email, telephone, matieresEnseignees, disponibilites });
}

async function updateProfesseur(id, { nom, prenom, email, telephone, matieresEnseignees, actif }) {
  const professeur = await Professeur.findById(id);
  if (!professeur) throw ApiError.notFound('Professeur introuvable.');

  if (nom !== undefined) professeur.nom = nom;
  if (prenom !== undefined) professeur.prenom = prenom;
  if (email !== undefined) professeur.email = email;
  if (telephone !== undefined) professeur.telephone = telephone;
  if (matieresEnseignees !== undefined) professeur.matieresEnseignees = matieresEnseignees;
  if (actif !== undefined) professeur.actif = actif;

  await professeur.save();
  return professeur;
}

async function updateDisponibilites(id, disponibilites) {
  if (!Array.isArray(disponibilites)) {
    throw ApiError.badRequest('Le champ "disponibilites" doit être un tableau.');
  }

  const professeur = await Professeur.findById(id);
  if (!professeur) throw ApiError.notFound('Professeur introuvable.');

  professeur.disponibilites = disponibilites;
  await professeur.save();
  return professeur;
}

async function deleteProfesseur(id) {
  const professeur = await Professeur.findByIdAndDelete(id);
  if (!professeur) throw ApiError.notFound('Professeur introuvable.');
}

module.exports = {
  listProfesseurs,
  getProfesseur,
  createProfesseur,
  updateProfesseur,
  updateDisponibilites,
  deleteProfesseur,
};
