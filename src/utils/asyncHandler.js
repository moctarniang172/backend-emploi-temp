// Évite de répéter des blocs try/catch dans chaque controller async.
// On enveloppe le controller ; toute erreur (ou rejet de promesse) est transmise
// automatiquement à next(), qui déclenche le middleware d'erreurs centralisé.

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
