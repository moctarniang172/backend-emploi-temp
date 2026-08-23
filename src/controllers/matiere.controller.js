// Ne gère que la partie HTTP du CRUD des matières.
// Toute la logique métier vit dans services/matiere.service.js.

const matiereService = require('../services/matiere.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const listMatieres = asyncHandler(async (req, res) => {
  const matieres = await matiereService.listMatieres();
  sendSuccess(res, 200, 'Liste des matières récupérée.', { matieres });
});

const getMatiere = asyncHandler(async (req, res) => {
  const matiere = await matiereService.getMatiere(req.params.id);
  sendSuccess(res, 200, 'Matière récupérée.', { matiere });
});

const createMatiere = asyncHandler(async (req, res) => {
  const matiere = await matiereService.createMatiere(req.body);
  sendSuccess(res, 201, 'Matière créée.', { matiere });
});

const updateMatiere = asyncHandler(async (req, res) => {
  const matiere = await matiereService.updateMatiere(req.params.id, req.body);
  sendSuccess(res, 200, 'Matière mise à jour.', { matiere });
});

const deleteMatiere = asyncHandler(async (req, res) => {
  await matiereService.deleteMatiere(req.params.id);
  sendSuccess(res, 200, 'Matière supprimée.');
});

module.exports = { listMatieres, getMatiere, createMatiere, updateMatiere, deleteMatiere };
