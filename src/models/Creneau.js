// Modèle central de l'emploi du temps : un "créneau" = un cours (matière/prof/salle/classe)
// à un jour et une plage horaire donnés. Il n'y a pas de modèle "EmploiDuTemps" séparé :
// l'emploi du temps d'une classe ou d'un professeur est simplement une requête filtrée
// sur cette collection (voir services/creneau.service.js).
//
// Astuce : heureDebut/heureFin sont stockées en string "HH:mm" (avec zéros, ex: "08:00").
// Avec ce format fixe, la comparaison lexicographique de MongoDB ($lt, $gt) donne exactement
// le même résultat qu'une comparaison numérique — pas besoin de convertir en minutes.

const mongoose = require('mongoose');
const { JOURS_SEMAINE } = require('../utils/constants');

const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const creneauSchema = new mongoose.Schema(
  {
    classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: true },
    matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
    professeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur', required: true },
    salle: { type: mongoose.Schema.Types.ObjectId, ref: 'Salle', required: true },
    jour: { type: String, enum: JOURS_SEMAINE, required: true },
    heureDebut: { type: String, required: true, match: HEURE_REGEX },
    heureFin: { type: String, required: true, match: HEURE_REGEX },
    anneeScolaire: { type: String, required: [true, "L'année scolaire est obligatoire."] },
    statut: { type: String, enum: ['actif', 'archive'], default: 'actif' },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// heureFin doit être strictement après heureDebut (comparaison de string valide grâce au format fixe).
creneauSchema.path('heureFin').validate(function (valeur) {
  return valeur > this.heureDebut;
}, "L'heure de fin doit être après l'heure de début.");

// Index composés pour accélérer les 3 requêtes de conflit (salle / professeur / classe).
creneauSchema.index({ jour: 1, salle: 1, anneeScolaire: 1 });
creneauSchema.index({ jour: 1, professeur: 1, anneeScolaire: 1 });
creneauSchema.index({ jour: 1, classe: 1, anneeScolaire: 1 });

module.exports = mongoose.model('Creneau', creneauSchema);
