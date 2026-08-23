// Point d'entrée unique qui regroupe tous les routers de l'API sous le préfixe /api.
// Au fur et à mesure des phases de développement, chaque nouveau router (auth, professeurs,
// classes, salles, matières, créneaux...) sera ajouté ici.

const express = require('express');

const router = express.Router();

// Route de vérification simple : permet de confirmer que l'API est en ligne.
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API en ligne.' });
});

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/matieres', require('./matiere.routes'));
router.use('/salles', require('./salle.routes'));
router.use('/professeurs', require('./professeur.routes'));
router.use('/classes', require('./classe.routes'));
router.use('/creneaux', require('./creneau.routes'));

module.exports = router;
