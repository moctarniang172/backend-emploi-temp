// Point d'entrée du backend : connecte la base de données puis démarre le serveur HTTP.

const app = require('./src/app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[Serveur] En écoute sur http://localhost:${env.port}`);
  });
}

start();
