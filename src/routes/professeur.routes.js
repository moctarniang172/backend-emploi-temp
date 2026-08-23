// Professeurs : lecture ouverte à l'admin et aux professeurs, écriture réservée à l'admin.

const express = require('express');
const {
  listProfesseurs,
  getProfesseur,
  createProfesseur,
  updateProfesseur,
  updateDisponibilites,
  deleteProfesseur,
} = require('../controllers/professeur.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/', authorize(ROLES.ADMIN, ROLES.PROFESSEUR), listProfesseurs);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.PROFESSEUR), getProfesseur);
router.post('/', authorize(ROLES.ADMIN), createProfesseur);
router.put('/:id', authorize(ROLES.ADMIN), updateProfesseur);
router.put('/:id/disponibilites', authorize(ROLES.ADMIN), updateDisponibilites);
router.delete('/:id', authorize(ROLES.ADMIN), deleteProfesseur);

module.exports = router;
