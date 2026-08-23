// Logique métier du CRUD des matières.

const Matiere = require('../models/Matiere');
const ApiError = require('../utils/ApiError');

async function listMatieres() {
  return Matiere.find().sort({ nom: 1 });
}

async function getMatiere(id) {
  const matiere = await Matiere.findById(id);
  if (!matiere) throw ApiError.notFound('Matière introuvable.');
  return matiere;
}

async function createMatiere({ nom, code, volumeHoraire }) {
  return Matiere.create({ nom, code, volumeHoraire });
}

async function updateMatiere(id, data) {
  const matiere = await Matiere.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!matiere) throw ApiError.notFound('Matière introuvable.');
  return matiere;
}

async function deleteMatiere(id) {
  const matiere = await Matiere.findByIdAndDelete(id);
  if (!matiere) throw ApiError.notFound('Matière introuvable.');
}

module.exports = { listMatieres, getMatiere, createMatiere, updateMatiere, deleteMatiere };
