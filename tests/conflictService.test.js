// Tests unitaires du cœur métier de l'application : la détection des 4 types de conflits.
// Utilise une base MongoDB en mémoire (mongodb-memory-server) pour ne jamais toucher
// la vraie base de données pendant les tests.

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { detecterConflits } = require('../src/services/conflictService');
const Classe = require('../src/models/Classe');
const Matiere = require('../src/models/Matiere');
const Professeur = require('../src/models/Professeur');
const Salle = require('../src/models/Salle');
const Creneau = require('../src/models/Creneau');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([
    Classe.deleteMany({}),
    Matiere.deleteMany({}),
    Professeur.deleteMany({}),
    Salle.deleteMany({}),
    Creneau.deleteMany({}),
  ]);
});

// Crée un jeu de données de base (1 classe, 1 matière, 1 professeur disponible Lundi 08h-12h, 1 salle)
async function creerJeuDeDonnees() {
  const classe = await Classe.create({ nom: 'L2 Info', anneeScolaire: '2025-2026' });
  const matiere = await Matiere.create({ nom: 'Mathématiques' });
  const professeur = await Professeur.create({
    nom: 'Diop',
    prenom: 'Awa',
    disponibilites: [{ jour: 'Lundi', creneaux: [{ heureDebut: '08:00', heureFin: '12:00' }] }],
  });
  const salle = await Salle.create({ nom: 'Salle B12' });
  return { classe, matiere, professeur, salle };
}

describe('conflictService.detecterConflits', () => {
  test("ne détecte aucun conflit sur un créneau libre et dans les dispos du prof", async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();

    const resultat = await detecterConflits({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id,
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '10:00',
      anneeScolaire: '2025-2026',
    });

    expect(resultat.hasConflict).toBe(false);
    expect(resultat.conflits).toHaveLength(0);
  });

  test('détecte un conflit de SALLE (même salle, chevauchement horaire)', async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();
    const autreClasse = await Classe.create({ nom: 'L3 Info', anneeScolaire: '2025-2026' });
    const autreProf = await Professeur.create({
      nom: 'Ndiaye',
      prenom: 'Cheikh',
      disponibilites: [{ jour: 'Lundi', creneaux: [{ heureDebut: '08:00', heureFin: '12:00' }] }],
    });

    await Creneau.create({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id,
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '10:00',
      anneeScolaire: '2025-2026',
    });

    const resultat = await detecterConflits({
      classe: autreClasse._id,
      matiere: matiere._id,
      professeur: autreProf._id,
      salle: salle._id, // même salle
      jour: 'Lundi',
      heureDebut: '09:00',
      heureFin: '11:00',
      anneeScolaire: '2025-2026',
    });

    expect(resultat.hasConflict).toBe(true);
    expect(resultat.conflits.map((c) => c.type)).toContain('CONFLIT_SALLE');
  });

  test('détecte un conflit de PROFESSEUR (même professeur, chevauchement horaire)', async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();
    const autreClasse = await Classe.create({ nom: 'L3 Info', anneeScolaire: '2025-2026' });
    const autreSalle = await Salle.create({ nom: 'Salle C1' });

    await Creneau.create({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id,
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '10:00',
      anneeScolaire: '2025-2026',
    });

    const resultat = await detecterConflits({
      classe: autreClasse._id,
      matiere: matiere._id,
      professeur: professeur._id, // même professeur
      salle: autreSalle._id,
      jour: 'Lundi',
      heureDebut: '09:00',
      heureFin: '11:00',
      anneeScolaire: '2025-2026',
    });

    expect(resultat.hasConflict).toBe(true);
    expect(resultat.conflits.map((c) => c.type)).toContain('CONFLIT_PROFESSEUR');
  });

  test('détecte un conflit de CLASSE (même classe, chevauchement horaire)', async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();
    const autreProf = await Professeur.create({
      nom: 'Ndiaye',
      prenom: 'Cheikh',
      disponibilites: [{ jour: 'Lundi', creneaux: [{ heureDebut: '08:00', heureFin: '12:00' }] }],
    });
    const autreSalle = await Salle.create({ nom: 'Salle C1' });

    await Creneau.create({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id,
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '10:00',
      anneeScolaire: '2025-2026',
    });

    const resultat = await detecterConflits({
      classe: classe._id, // même classe
      matiere: matiere._id,
      professeur: autreProf._id,
      salle: autreSalle._id,
      jour: 'Lundi',
      heureDebut: '09:00',
      heureFin: '11:00',
      anneeScolaire: '2025-2026',
    });

    expect(resultat.hasConflict).toBe(true);
    expect(resultat.conflits.map((c) => c.type)).toContain('CONFLIT_CLASSE');
  });

  test("détecte une INDISPONIBILITE quand le créneau est hors des plages déclarées du professeur", async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();

    const resultat = await detecterConflits({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id, // dispo seulement 08:00-12:00
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '14:00',
      heureFin: '16:00',
      anneeScolaire: '2025-2026',
    });

    expect(resultat.hasConflict).toBe(true);
    expect(resultat.conflits.map((c) => c.type)).toContain('INDISPONIBILITE_PROFESSEUR');
  });

  test("exclut le créneau lui-même via excludeCreneauId (cas d'une modification sans changement de conflit)", async () => {
    const { classe, matiere, professeur, salle } = await creerJeuDeDonnees();

    const creneau = await Creneau.create({
      classe: classe._id,
      matiere: matiere._id,
      professeur: professeur._id,
      salle: salle._id,
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '10:00',
      anneeScolaire: '2025-2026',
    });

    const resultat = await detecterConflits(
      {
        classe: classe._id,
        matiere: matiere._id,
        professeur: professeur._id,
        salle: salle._id,
        jour: 'Lundi',
        heureDebut: '08:30', // léger changement d'horaire du MÊME créneau
        heureFin: '10:30',
        anneeScolaire: '2025-2026',
      },
      creneau._id
    );

    expect(resultat.hasConflict).toBe(false);
  });
});
