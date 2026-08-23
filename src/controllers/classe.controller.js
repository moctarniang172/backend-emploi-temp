// Ne gère que la partie HTTP du CRUD des classes.
// Toute la logique métier (dont la génération du compte étudiant) vit dans services/classe.service.js.

const classeService = require('../services/classe.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const listClasses = asyncHandler(async (req, res) => {
  const classes = await classeService.listClasses();
  sendSuccess(res, 200, 'Liste des classes récupérée.', { classes });
});

const getClasse = asyncHandler(async (req, res) => {
  const classe = await classeService.getClasse(req.params.id);
  sendSuccess(res, 200, 'Classe récupérée.', { classe });
});

const createClasse = asyncHandler(async (req, res) => {
  const { classe, identifiantsEtudiant } = await classeService.createClasse(req.body);
  sendSuccess(res, 201, 'Classe créée et compte étudiant généré.', { classe, identifiantsEtudiant });
});

const updateClasse = asyncHandler(async (req, res) => {
  const classe = await classeService.updateClasse(req.params.id, req.body);
  sendSuccess(res, 200, 'Classe mise à jour.', { classe });
});

const deleteClasse = asyncHandler(async (req, res) => {
  await classeService.deleteClasse(req.params.id);
  sendSuccess(res, 200, 'Classe et compte étudiant associé supprimés.');
});

module.exports = { listClasses, getClasse, createClasse, updateClasse, deleteClasse };
