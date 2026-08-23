// Une salle de cours physique, avec sa capacité et son type (utile pour filtrer
// les salles compatibles avec un cours donné, ex: un TP informatique nécessite une salle "informatique").

const mongoose = require('mongoose');

const salleSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la salle est obligatoire.'], unique: true, trim: true },
    capacite: { type: Number, default: null },
    type: {
      type: String,
      enum: ['standard', 'labo', 'amphi', 'informatique'],
      default: 'standard',
    },
    equipements: { type: [String], default: [] },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salle', salleSchema);
