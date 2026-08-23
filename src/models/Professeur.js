// Fiche d'un professeur : informations de contact, matières qu'il enseigne, et ses
// disponibilités déclarées (utilisées par conflictService.js pour valider les créneaux).
//
// Structure des disponibilités : un tableau "jour -> liste de plages horaires disponibles".
// Ex: [{ jour: 'Lundi', creneaux: [{heureDebut:'08:00', heureFin:'12:00'}, {heureDebut:'14:00', heureFin:'17:00'}] }]
// Un créneau de cours n'est valide que s'il est ENTIÈREMENT contenu dans une de ces plages.

const mongoose = require('mongoose');
const { JOURS_SEMAINE } = require('../utils/constants');

const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const plageHoraireSchema = new mongoose.Schema(
  {
    heureDebut: { type: String, required: true, match: HEURE_REGEX },
    heureFin: { type: String, required: true, match: HEURE_REGEX },
  },
  { _id: false }
);

const disponibiliteSchema = new mongoose.Schema(
  {
    jour: { type: String, enum: JOURS_SEMAINE, required: true },
    creneaux: { type: [plageHoraireSchema], default: [] },
  },
  { _id: false }
);

const professeurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est obligatoire.'], trim: true },
    prenom: { type: String, required: [true, 'Le prénom est obligatoire.'], trim: true },
    email: { type: String, trim: true, lowercase: true },
    telephone: { type: String, trim: true },
    matieresEnseignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Matiere' }],
    disponibilites: { type: [disponibiliteSchema], default: [] },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Professeur', professeurSchema);
