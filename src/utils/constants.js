// Constantes partagées par tout le backend (rôles, jours de la semaine, types de conflits).
// Regrouper ces valeurs ici évite les fautes de frappe et centralise les modifications futures.

const ROLES = {
  ADMIN: 'admin',
  PROFESSEUR: 'professeur',
  ETUDIANT: 'etudiant',
};

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const TYPES_CONFLIT = {
  SALLE: 'CONFLIT_SALLE',
  PROFESSEUR: 'CONFLIT_PROFESSEUR',
  CLASSE: 'CONFLIT_CLASSE',
  DISPONIBILITE: 'INDISPONIBILITE_PROFESSEUR',
};

module.exports = { ROLES, JOURS_SEMAINE, TYPES_CONFLIT };
