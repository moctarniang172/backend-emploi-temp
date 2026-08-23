// Routes liées à l'authentification : connexion, profil courant, changement de mot de passe.

const express = require('express');
const { login, getMe, changePassword } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
