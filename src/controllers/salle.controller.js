// Ne gère que la partie HTTP du CRUD des salles.
// Toute la logique métier vit dans services/salle.service.js.

const salleService = require('../services/salle.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const listSalles = asyncHandler(async (req, res) => {
  const salles = await salleService.listSalles();
  sendSuccess(res, 200, 'Liste des salles récupérée.', { salles });
});

const getSalle = asyncHandler(async (req, res) => {
  const salle = await salleService.getSalle(req.params.id);
  sendSuccess(res, 200, 'Salle récupérée.', { salle });
});

const createSalle = asyncHandler(async (req, res) => {
  const salle = await salleService.createSalle(req.body);
  sendSuccess(res, 201, 'Salle créée.', { salle });
});

const updateSalle = asyncHandler(async (req, res) => {
  const salle = await salleService.updateSalle(req.params.id, req.body);
  sendSuccess(res, 200, 'Salle mise à jour.', { salle });
});

const deleteSalle = asyncHandler(async (req, res) => {
  await salleService.deleteSalle(req.params.id);
  sendSuccess(res, 200, 'Salle supprimée.');
});

module.exports = { listSalles, getSalle, createSalle, updateSalle, deleteSalle };
