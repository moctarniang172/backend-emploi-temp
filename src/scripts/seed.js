// Script exécuté avec "npm run seed" : crée un compte administrateur par défaut
// s'il n'existe pas déjà, pour permettre la première connexion à la plateforme.

const connectDB = require('../config/db');
const env = require('../config/env');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');
const mongoose = require('mongoose');

async function seed() {
  await connectDB();

  const adminExistant = await User.findOne({ email: env.seedAdminEmail });
  if (adminExistant) {
    console.log(`[Seed] Le compte admin "${env.seedAdminEmail}" existe déjà.`);
  } else {
    await User.create({
      nom: 'Admin',
      prenom: 'Principal',
      email: env.seedAdminEmail,
      password: env.seedAdminPassword,
      role: ROLES.ADMIN,
    });
    console.log(`[Seed] Compte admin créé : ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('[Seed] Erreur :', error);
  process.exit(1);
});
