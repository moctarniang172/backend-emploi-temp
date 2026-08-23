// Ne gère que la partie HTTP des créneaux : lecture de la requête, contrôle d'accès "scopé"
// (un professeur/étudiant ne peut consulter QUE son propre emploi du temps), envoi de la réponse.
// Toute la logique métier (CRUD, détection de conflits) vit dans services/creneau.service.js.

const creneauService = require('../services/creneau.service');
const classeService = require('../services/classe.service');
const professeurService = require('../services/professeur.service');
const pdfService = require('../services/pdfService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ROLES } = require('../utils/constants');

// GET /api/creneaux (admin uniquement, filtrable via query params)
const listCreneaux = asyncHandler(async (req, res) => {
  const creneaux = await creneauService.listCreneaux(req.query);
  sendSuccess(res, 200, 'Liste des créneaux récupérée.', { creneaux });
});

// GET /api/creneaux/classe/:classeId
const getCreneauxParClasse = asyncHandler(async (req, res) => {
  const { classeId } = req.params;

  // Un étudiant ne peut consulter que l'emploi du temps de SA classe.
  if (req.user.role === ROLES.ETUDIANT && String(req.user.refClasse) !== classeId) {
    throw ApiError.forbidden("Vous ne pouvez consulter que l'emploi du temps de votre classe.");
  }

  const creneaux = await creneauService.getCreneauxParClasse(classeId, req.query.anneeScolaire);
  sendSuccess(res, 200, 'Emploi du temps de la classe récupéré.', { creneaux });
});

// GET /api/creneaux/professeur/:professeurId
const getCreneauxParProfesseur = asyncHandler(async (req, res) => {
  const { professeurId } = req.params;

  // Un professeur ne peut consulter que SON PROPRE emploi du temps.
  if (req.user.role === ROLES.PROFESSEUR && String(req.user.refProfesseur) !== professeurId) {
    throw ApiError.forbidden('Vous ne pouvez consulter que votre propre emploi du temps.');
  }

  const creneaux = await creneauService.getCreneauxParProfesseur(professeurId, req.query.anneeScolaire);
  sendSuccess(res, 200, 'Emploi du temps du professeur récupéré.', { creneaux });
});

// GET /api/creneaux/classe/:classeId/pdf
const getPdfParClasse = asyncHandler(async (req, res) => {
  const { classeId } = req.params;

  if (req.user.role === ROLES.ETUDIANT && String(req.user.refClasse) !== classeId) {
    throw ApiError.forbidden("Vous ne pouvez consulter que l'emploi du temps de votre classe.");
  }

  const [classe, creneaux] = await Promise.all([
    classeService.getClasse(classeId),
    creneauService.getCreneauxParClasse(classeId, req.query.anneeScolaire),
  ]);

  const pdf = await pdfService.genererPdfEmploiDuTemps({
    titre: `Emploi du temps — ${classe.nom}`,
    sousTitre: classe.anneeScolaire,
    creneaux,
    avecClasse: false, // déjà indiqué dans le titre, inutile de le répéter dans chaque ligne
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="emploi-du-temps-${classe.nom}.pdf"`,
  });
  res.send(pdf);
});

// GET /api/creneaux/professeur/:professeurId/pdf
const getPdfParProfesseur = asyncHandler(async (req, res) => {
  const { professeurId } = req.params;

  if (req.user.role === ROLES.PROFESSEUR && String(req.user.refProfesseur) !== professeurId) {
    throw ApiError.forbidden('Vous ne pouvez consulter que votre propre emploi du temps.');
  }

  const [professeur, creneaux] = await Promise.all([
    professeurService.getProfesseur(professeurId),
    creneauService.getCreneauxParProfesseur(professeurId, req.query.anneeScolaire),
  ]);

  const pdf = await pdfService.genererPdfEmploiDuTemps({
    titre: `Emploi du temps — ${professeur.prenom} ${professeur.nom}`,
    creneaux,
    avecProfesseur: false, // déjà indiqué dans le titre, inutile de le répéter dans chaque ligne
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="emploi-du-temps-${professeur.nom}.pdf"`,
  });
  res.send(pdf);
});

// POST /api/creneaux/check-conflicts — vérification à blanc, n'écrit rien en base.
const checkConflicts = asyncHandler(async (req, res) => {
  const resultat = await creneauService.checkConflicts(req.body);
  sendSuccess(res, 200, 'Vérification effectuée.', resultat);
});

// POST /api/creneaux
const createCreneau = asyncHandler(async (req, res) => {
  const creneau = await creneauService.createCreneau(req.body, req.user._id);
  sendSuccess(res, 201, 'Créneau créé.', { creneau });
});

// PUT /api/creneaux/:id
const updateCreneau = asyncHandler(async (req, res) => {
  const creneau = await creneauService.updateCreneau(req.params.id, req.body);
  sendSuccess(res, 200, 'Créneau mis à jour.', { creneau });
});

// DELETE /api/creneaux/:id
const deleteCreneau = asyncHandler(async (req, res) => {
  await creneauService.deleteCreneau(req.params.id);
  sendSuccess(res, 200, 'Créneau supprimé.');
});

module.exports = {
  listCreneaux,
  getCreneauxParClasse,
  getCreneauxParProfesseur,
  getPdfParClasse,
  getPdfParProfesseur,
  checkConflicts,
  createCreneau,
  updateCreneau,
  deleteCreneau,
};
