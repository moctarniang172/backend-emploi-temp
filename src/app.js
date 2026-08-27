// Configuration de l'application Express : middlewares globaux (CORS, JSON), montage
// des routes de l'API, puis gestion des erreurs. Séparé de server.js pour pouvoir
// importer "app" directement dans les tests d'intégration sans démarrer un vrai serveur.

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
