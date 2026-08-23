// Gère la connexion à MongoDB via Mongoose.
// Appelé une seule fois au démarrage du serveur (voir server.js).

const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[MongoDB] Connecté à la base : ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Échec de connexion :', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
