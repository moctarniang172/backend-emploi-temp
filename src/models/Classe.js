// Une classe/groupe d'élèves (ex: "L2 Info", année scolaire 2025-2026).
// Chaque classe a un compte étudiant partagé (voir User.js, role='etudiant', refClasse)
// permettant à tous les élèves de la classe de consulter le même emploi du temps.

const mongoose = require('mongoose');

const classeSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la classe est obligatoire.'], unique: true, trim: true },
    filiere: { type: String, trim: true },
    niveau: { type: String, trim: true },
    effectif: { type: Number, default: null },
    anneeScolaire: { type: String, required: [true, "L'année scolaire est obligatoire."], trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classe', classeSchema);
