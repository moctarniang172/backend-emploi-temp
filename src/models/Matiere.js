// Une matière enseignée (ex: "Mathématiques", code "MATH301").
// volumeHoraire est optionnel : nombre d'heures totales prévues sur l'année, utile
// pour de futures statistiques ou une génération automatique d'emploi du temps.

const mongoose = require('mongoose');

const matiereSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la matière est obligatoire.'], unique: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    volumeHoraire: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Matiere', matiereSchema);
