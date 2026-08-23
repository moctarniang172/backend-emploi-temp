// Logique métier des créneaux : CRUD, appel systématique à conflictService avant toute
// écriture réelle, et agrégation "emploi du temps" par classe ou par professeur (simple
// requête filtrée sur la collection Creneau, pas de modèle séparé).

const Creneau = require('../models/Creneau');
const ApiError = require('../utils/ApiError');
const conflictService = require('./conflictService');

const CHAMPS_POPULATE = 'classe matiere professeur salle';

async function listCreneaux(filtres = {}) {
  const { classe, professeur, salle, jour, anneeScolaire, statut } = filtres;
  const query = {};
  if (classe) query.classe = classe;
  if (professeur) query.professeur = professeur;
  if (salle) query.salle = salle;
  if (jour) query.jour = jour;
  if (anneeScolaire) query.anneeScolaire = anneeScolaire;
  query.statut = statut || 'actif';

  return Creneau.find(query).populate(CHAMPS_POPULATE).sort({ jour: 1, heureDebut: 1 });
}

async function getCreneauxParClasse(classeId, anneeScolaire) {
  const query = { classe: classeId, statut: 'actif' };
  if (anneeScolaire) query.anneeScolaire = anneeScolaire;
  return Creneau.find(query).populate(CHAMPS_POPULATE).sort({ jour: 1, heureDebut: 1 });
}

async function getCreneauxParProfesseur(professeurId, anneeScolaire) {
  const query = { professeur: professeurId, statut: 'actif' };
  if (anneeScolaire) query.anneeScolaire = anneeScolaire;
  return Creneau.find(query).populate(CHAMPS_POPULATE).sort({ jour: 1, heureDebut: 1 });
}

// Vérification "à blanc" : n'écrit rien en base, sert au retour visuel en direct du formulaire.
// excludeCreneauId (optionnel) permet, en mode édition, de ne pas signaler le créneau
// comme étant en conflit avec lui-même.
async function checkConflicts({ excludeCreneauId, ...criteres }) {
  return conflictService.detecterConflits(criteres, excludeCreneauId || null);
}

async function createCreneau(donnees, creePar) {
  const { hasConflict, conflits } = await conflictService.detecterConflits(donnees);
  if (hasConflict) {
    throw ApiError.conflict('Ce créneau entre en conflit avec l’emploi du temps existant.', conflits);
  }

  const creneau = await Creneau.create({ ...donnees, creePar });
  return creneau.populate(CHAMPS_POPULATE);
}

async function updateCreneau(id, donnees) {
  const creneauExistant = await Creneau.findById(id);
  if (!creneauExistant) throw ApiError.notFound('Créneau introuvable.');

  // Fusionne les champs fournis avec l'existant pour vérifier les conflits sur l'état final.
  const donneesCompletes = {
    classe: donnees.classe ?? creneauExistant.classe,
    matiere: donnees.matiere ?? creneauExistant.matiere,
    professeur: donnees.professeur ?? creneauExistant.professeur,
    salle: donnees.salle ?? creneauExistant.salle,
    jour: donnees.jour ?? creneauExistant.jour,
    heureDebut: donnees.heureDebut ?? creneauExistant.heureDebut,
    heureFin: donnees.heureFin ?? creneauExistant.heureFin,
    anneeScolaire: donnees.anneeScolaire ?? creneauExistant.anneeScolaire,
  };

  const { hasConflict, conflits } = await conflictService.detecterConflits(donneesCompletes, id);
  if (hasConflict) {
    throw ApiError.conflict('Ce créneau entre en conflit avec l’emploi du temps existant.', conflits);
  }

  Object.assign(creneauExistant, donneesCompletes);
  await creneauExistant.save();
  return creneauExistant.populate(CHAMPS_POPULATE);
}

async function deleteCreneau(id) {
  const creneau = await Creneau.findByIdAndDelete(id);
  if (!creneau) throw ApiError.notFound('Créneau introuvable.');
}

module.exports = {
  listCreneaux,
  getCreneauxParClasse,
  getCreneauxParProfesseur,
  checkConflicts,
  createCreneau,
  updateCreneau,
  deleteCreneau,
};
