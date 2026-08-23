// Classes : lecture ouverte à tous les rôles authentifiés, écriture réservée à l'admin.

const express = require('express');
const {
  listClasses,
  getClasse,
  createClasse,
  updateClasse,
  deleteClasse,
} = require('../controllers/classe.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken);

router.get('/', listClasses);
router.get('/:id', getClasse);
router.post('/', authorize(ROLES.ADMIN), createClasse);
router.put('/:id', authorize(ROLES.ADMIN), updateClasse);
router.delete('/:id', authorize(ROLES.ADMIN), deleteClasse);

module.exports = router;
