// Centralise la lecture des variables d'environnement (process.env) avec des valeurs
// par défaut raisonnables pour le développement local. Tout le reste du code importe
// cet objet plutôt que de lire process.env directement, pour n'avoir qu'un seul endroit
// à modifier si un nom de variable change.

require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emploi_du_temps',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_a_ne_jamais_utiliser_en_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'https://backend-emploi-temp.onrender.com/',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@ecole.sn',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
};

module.exports = env;
