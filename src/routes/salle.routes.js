// Salles : lecture ouverte à tous les rôles authentifiés, écriture réservée à l'admin.

const express = require('express');
const {
  listSalles,
  getSalle,
  createSalle,
  updateSalle,
  deleteSalle,
} = require('../controllers/salle.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/', listSalles);
router.get('/:id', getSalle);
router.post('/', authorize(ROLES.ADMIN), createSalle);
router.put('/:id', authorize(ROLES.ADMIN), updateSalle);
router.delete('/:id', authorize(ROLES.ADMIN), deleteSalle);

module.exports = router;
