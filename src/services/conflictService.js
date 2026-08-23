// Service dédié à la détection des 4 types de conflits exigés par le cahier des charges :
// conflit de salle, conflit de professeur, conflit de classe, et indisponibilité du professeur.
//
// Appelé explicitement par creneau.service.js avant toute création/modification réelle,
// et réutilisé tel quel par l'endpoint "check-conflicts" qui permet au frontend de vérifier
// à blanc (sans rien écrire en base) pendant que l'utilisateur remplit le formulaire.
//
// Choix volontaire : PAS un hook Mongoose pre('save') ni un middleware Express générique.
// Un service explicite est plus simple à tester unitairement et permet de réutiliser
// exactement la même logique pour la vérification "à blanc" (check-conflicts).

const Creneau = require('../models/Creneau');
const Professeur = require('../models/Professeur');
const { TYPES_CONFLIT } = require('../utils/constants');

// Deux intervalles [A_debut, A_fin] et [B_debut, B_fin] se chevauchent si :
// A_debut < B_fin ET B_debut < A_fin. Traduit ici en filtre Mongoose.
function requeteChevauchement({ jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }) {
  
  const filtre = {jour,anneeScolaire,statut: 'actif',heureDebut: { $lt: heureFin },heureFin: { $gt: heureDebut },};
  if (excludeCreneauId) {
    filtre._id = { $ne: excludeCreneauId };
  }
  return filtre;
}

async function verifierConflitSalle({ salle, jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }) {
  const conflit = await Creneau.findOne({
    ...requeteChevauchement({ jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }),
    salle,
  }).populate('classe matiere');

  if (!conflit) return null;

  return {
    type: TYPES_CONFLIT.SALLE,
    message: `Cette salle est déjà occupée le ${jour} de ${conflit.heureDebut} à ${conflit.heureFin} (Matière: ${conflit.matiere?.nom ?? '?'}, Classe: ${conflit.classe?.nom ?? '?'}).`,
    creneauExistantId: conflit._id,
  };
}

async function verifierConflitProfesseur({ professeur, jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }) {
  const conflit = await Creneau.findOne({
    ...requeteChevauchement({ jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }),
    professeur,
  }).populate('classe matiere');

  if (!conflit) return null;

  return {
    type: TYPES_CONFLIT.PROFESSEUR,
    message: `Ce professeur a déjà un cours le ${jour} de ${conflit.heureDebut} à ${conflit.heureFin} (Matière: ${conflit.matiere?.nom ?? '?'}, Classe: ${conflit.classe?.nom ?? '?'}).`,
    creneauExistantId: conflit._id,
  };
}

async function verifierConflitClasse({ classe, jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }) {
  const conflit = await Creneau.findOne({
    ...requeteChevauchement({ jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId }),
    classe,
  }).populate('matiere professeur');

  if (!conflit) return null;

  return {
    type: TYPES_CONFLIT.CLASSE,
    message: `Cette classe a déjà un cours le ${jour} de ${conflit.heureDebut} à ${conflit.heureFin} (Matière: ${conflit.matiere?.nom ?? '?'}, Professeur: ${conflit.professeur?.nom ?? '?'}).`,
    creneauExistantId: conflit._id,
  };
}

// Vérifie que le créneau proposé est ENTIÈREMENT contenu dans une plage de disponibilité
// déclarée du professeur pour ce jour. Pas de requête sur Creneau : lecture directe de la fiche Professeur.
async function verifierDisponibiliteProfesseur({ professeur, jour, heureDebut, heureFin }) {
  const prof = await Professeur.findById(professeur).lean();
  if (!prof) return null; // le professeur n'existe pas : ce n'est pas un conflit de disponibilité en soi

  const dispoJour = prof.disponibilites.find((d) => d.jour === jour);
  const estDisponible = dispoJour?.creneaux.some(
    (c) => c.heureDebut <= heureDebut && c.heureFin >= heureFin
  );

  if (estDisponible) return null;

  return {
    type: TYPES_CONFLIT.DISPONIBILITE,
    message: `Le professeur ${prof.nom} ${prof.prenom} n'est pas déclaré disponible le ${jour} entre ${heureDebut} et ${heureFin}.`,
  };
}

// Fonction principale : exécute les 4 vérifications en parallèle et agrège le résultat.
async function detecterConflits(
  { classe, professeur, salle, jour, heureDebut, heureFin, anneeScolaire },
  excludeCreneauId = null
) {
  const params = { jour, anneeScolaire, heureDebut, heureFin, excludeCreneauId };

  const resultats = await Promise.all([
    verifierConflitSalle({ ...params, salle }),
    verifierConflitProfesseur({ ...params, professeur }),
    verifierConflitClasse({ ...params, classe }),
    verifierDisponibiliteProfesseur({ professeur, jour, heureDebut, heureFin }),
  ]);

  const conflits = resultats.filter(Boolean);

  return { hasConflict: conflits.length > 0, conflits };
}

module.exports = { detecterConflits };
