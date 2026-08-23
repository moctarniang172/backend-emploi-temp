// Ne gère que la partie HTTP du CRUD des professeurs.
// Toute la logique métier vit dans services/professeur.service.js.

const professeurService = require('../services/professeur.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const listProfesseurs = asyncHandler(async (req, res) => {
  const professeurs = await professeurService.listProfesseurs();
  sendSuccess(res, 200, 'Liste des professeurs récupérée.', { professeurs });
});

const getProfesseur = asyncHandler(async (req, res) => {
  const professeur = await professeurService.getProfesseur(req.params.id);
  sendSuccess(res, 200, 'Professeur récupéré.', { professeur });
});

const createProfesseur = asyncHandler(async (req, res) => {
  const professeur = await professeurService.createProfesseur(req.body);
  sendSuccess(res, 201, 'Professeur créé.', { professeur });
});

const updateProfesseur = asyncHandler(async (req, res) => {
  const professeur = await professeurService.updateProfesseur(req.params.id, req.body);
  sendSuccess(res, 200, 'Professeur mis à jour.', { professeur });
});

const updateDisponibilites = asyncHandler(async (req, res) => {
  const professeur = await professeurService.updateDisponibilites(req.params.id, req.body.disponibilites);
  sendSuccess(res, 200, 'Disponibilités mises à jour.', { professeur });
});

const deleteProfesseur = asyncHandler(async (req, res) => {
  await professeurService.deleteProfesseur(req.params.id);
  sendSuccess(res, 200, 'Professeur supprimé.');
});

module.exports = {
  listProfesseurs,
  getProfesseur,
  createProfesseur,
  updateProfesseur,
  updateDisponibilites,
  deleteProfesseur,
};
