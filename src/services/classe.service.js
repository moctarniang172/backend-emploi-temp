// Logique métier du CRUD des classes, y compris la génération/suppression automatique
// du compte étudiant partagé associé à chaque classe.

const Classe = require('../models/Classe');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');
const { genererEmailClasse, genererMotDePasseAleatoire } = require('../utils/genererIdentifiants');

async function listClasses() {
  return Classe.find().sort({ nom: 1 });
}

async function getClasse(id) {
  const classe = await Classe.findById(id);
  if (!classe) throw ApiError.notFound('Classe introuvable.');
  return classe;
}

async function createClasse({ nom, filiere, niveau, effectif, anneeScolaire }) {
  const classe = await Classe.create({ nom, filiere, niveau, effectif, anneeScolaire });

  // Génère automatiquement le compte étudiant partagé de la classe.
  const emailEtudiant = genererEmailClasse(classe.nom);
  const motDePasseGenere = genererMotDePasseAleatoire();

  await User.create({
    nom: 'Étudiants',
    prenom: classe.nom,
    email: emailEtudiant,
    password: motDePasseGenere,
    role: ROLES.ETUDIANT,
    refClasse: classe._id,
  });

  return { classe, identifiantsEtudiant: { email: emailEtudiant, motDePasse: motDePasseGenere } };
}

async function updateClasse(id, data) {
  // Remarque : l'email du compte étudiant n'est PAS régénéré si le nom de la classe change,
  // pour ne pas invalider les identifiants déjà communiqués aux élèves.
  const classe = await Classe.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!classe) throw ApiError.notFound('Classe introuvable.');
  return classe;
}

async function deleteClasse(id) {
  const classe = await Classe.findByIdAndDelete(id);
  if (!classe) throw ApiError.notFound('Classe introuvable.');

  // Supprime aussi le compte étudiant partagé associé, devenu orphelin.
  await User.deleteMany({ role: ROLES.ETUDIANT, refClasse: classe._id });
}

module.exports = { listClasses, getClasse, createClasse, updateClasse, deleteClasse };
