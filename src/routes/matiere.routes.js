// Matières : lecture ouverte à tous les rôles authentifiés, écriture réservée à l'admin.

const express = require('express');
const {
  listMatieres,
  getMatiere,
  createMatiere,
  updateMatiere,
  deleteMatiere,
} = require('../controllers/matiere.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/', listMatieres);
router.get('/:id', getMatiere);
router.post('/', authorize(ROLES.ADMIN), createMatiere);
router.put('/:id', authorize(ROLES.ADMIN), updateMatiere);
router.delete('/:id', authorize(ROLES.ADMIN), deleteMatiere);

module.exports = router;
