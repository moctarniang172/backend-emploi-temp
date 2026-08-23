// Modèle de compte utilisateur. Un seul modèle "User" pour les 3 rôles (admin, professeur,
// etudiant) plutôt que 3 collections séparées : plus simple à interroger et à faire évoluer.
//
// - role === 'admin'      : refProfesseur et refClasse restent null.
// - role === 'professeur' : refProfesseur doit pointer vers son fiche Professeur.
// - role === 'etudiant'   : refClasse doit pointer vers la classe (compte PARTAGÉ par classe,
//                           décision validée avec le client : pas de compte individuel par élève).

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est obligatoire.'], trim: true },
    prenom: { type: String, required: [true, 'Le prénom est obligatoire.'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      select: false, // jamais renvoyé par défaut dans les requêtes
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères.'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Le rôle est obligatoire.'],
    },
    refProfesseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur', default: null },
    refClasse: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', default: null },
    actif: { type: Boolean, default: true },
    derniereConnexion: { type: Date, default: null },
  },
  { timestamps: true }
);

// Vérifie la cohérence rôle <-> référence, quel que soit le rôle fourni.
userSchema.pre('validate', function (next) {
  if (this.role === ROLES.PROFESSEUR && !this.refProfesseur) {
    return next(new Error("Un compte professeur doit être lié à une fiche professeur (refProfesseur)."));
  }
  if (this.role === ROLES.ETUDIANT && !this.refClasse) {
    return next(new Error('Un compte étudiant doit être lié à une classe (refClasse).'));
  }
  if (this.role === ROLES.ADMIN) {
    this.refProfesseur = null;
    this.refClasse = null;
  }
  next();
});

// Hache le mot de passe uniquement s'il a été modifié (évite de le re-hacher à chaque save).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.password);
};

module.exports = mongoose.model('User', userSchema);
