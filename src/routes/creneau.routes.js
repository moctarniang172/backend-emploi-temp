// Routes des créneaux : écriture réservée à l'admin, lecture "scopée" par rôle
// (voir creneau.controller.js pour le détail du contrôle d'accès classe/professeur).

const express = require('express');
const {
  listCreneaux,
  getCreneauxParClasse,
  getCreneauxParProfesseur,
  getPdfParClasse,
  getPdfParProfesseur,
  checkConflicts,
  createCreneau,
  updateCreneau,
  deleteCreneau,
} = require('../controllers/creneau.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/', authorize(ROLES.ADMIN), listCreneaux);
router.get('/classe/:classeId', authorize(ROLES.ADMIN, ROLES.PROFESSEUR, ROLES.ETUDIANT), getCreneauxParClasse);
router.get('/classe/:classeId/pdf', authorize(ROLES.ADMIN, ROLES.PROFESSEUR, ROLES.ETUDIANT), getPdfParClasse);
router.get('/professeur/:professeurId', authorize(ROLES.ADMIN, ROLES.PROFESSEUR), getCreneauxParProfesseur);
router.get('/professeur/:professeurId/pdf', authorize(ROLES.ADMIN, ROLES.PROFESSEUR), getPdfParProfesseur);
router.post('/check-conflicts', authorize(ROLES.ADMIN), checkConflicts);
router.post('/', authorize(ROLES.ADMIN), createCreneau);
router.put('/:id', authorize(ROLES.ADMIN), updateCreneau);
router.delete('/:id', authorize(ROLES.ADMIN), deleteCreneau);

module.exports = router;
