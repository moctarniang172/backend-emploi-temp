// Logique métier du CRUD des salles.

const Salle = require('../models/Salle');
const ApiError = require('../utils/ApiError');

async function listSalles() {
  return Salle.find().sort({ nom: 1 });
}

async function getSalle(id) {
  const salle = await Salle.findById(id);
  if (!salle) throw ApiError.notFound('Salle introuvable.');
  return salle;
}

async function createSalle({ nom, capacite, type, equipements }) {
  return Salle.create({ nom, capacite, type, equipements });
}

async function updateSalle(id, data) {
  const salle = await Salle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!salle) throw ApiError.notFound('Salle introuvable.');
  return salle;
}

async function deleteSalle(id) {
  const salle = await Salle.findByIdAndDelete(id);
  if (!salle) throw ApiError.notFound('Salle introuvable.');
}

module.exports = { listSalles, getSalle, createSalle, updateSalle, deleteSalle };
