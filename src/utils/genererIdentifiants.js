// Petit utilitaire pour générer un email et un mot de passe lisibles quand l'admin
// crée une classe : sert à créer automatiquement le compte étudiant partagé de cette classe.

const crypto = require('crypto');

function slugify(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents (é -> e, etc.)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function genererEmailClasse(nomClasse) {
  return `${slugify(nomClasse)}@etudiant.ecole.local`;
}

function genererMotDePasseAleatoire() {
  return crypto.randomBytes(6).toString('hex'); // ex: "a1b2c3d4e5f6"
}

module.exports = { slugify, genererEmailClasse, genererMotDePasseAleatoire };
// Email : informatique-de-gestion@etudiant.ecole.local

// Mot de passe : fcad8a3b9257