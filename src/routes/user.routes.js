// Routes de gestion des comptes utilisateurs — toutes réservées à l'administrateur.

const express = require('express');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(verifyToken, authorize(ROLES.ADMIN));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
