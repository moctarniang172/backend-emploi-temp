// Génère un PDF de l'emploi du temps sous forme de TABLEAU (une ligne par créneau, une
// colonne par information — jour, heure, matière, etc.), avec des bordures de cellule
// visibles. pdfkit ne fournit pas de composant "tableau" prêt à l'emploi : on dessine donc
// nous-mêmes les rectangles et le texte de chaque cellule (voir dessinerTableau ci-dessous).

const PDFDocument = require('pdfkit');
const { JOURS_SEMAINE } = require('../utils/constants');

const HAUTEUR_LIGNE = 22;
const HAUTEUR_ENTETE = 24;

// Dessine l'en-tête du tableau (fond grisé + titres de colonnes) à la position Y donnée.
function dessinerEntete(doc, colonnes, x, y) {
  doc.font('Helvetica-Bold').fontSize(9);
  let curseurX = x;
  colonnes.forEach((colonne) => {
    doc.rect(curseurX, y, colonne.largeur, HAUTEUR_ENTETE).fillAndStroke('#eef2ff', '#c7d2fe');
    doc.fillColor('#1e293b').text(colonne.titre, curseurX + 4, y + 7, { width: colonne.largeur - 8 });
    curseurX += colonne.largeur;
  });
  doc.fillColor('#000');
}

// Dessine une ligne de données (une cellule par colonne, avec bordure).
function dessinerLigne(doc, colonnes, creneau, x, y) {
  doc.font('Helvetica').fontSize(9);
  let curseurX = x;
  colonnes.forEach((colonne) => {
    doc.rect(curseurX, y, colonne.largeur, HAUTEUR_LIGNE).stroke('#e2e8f0');
    doc.fillColor('#1e293b').text(colonne.valeur(creneau), curseurX + 4, y + 6, {
      width: colonne.largeur - 8,
      ellipsis: true,
    });
    curseurX += colonne.largeur;
  });
}

// Dessine le tableau complet, avec gestion du passage à la page suivante et répétition
// de l'en-tête sur chaque nouvelle page.
function dessinerTableau(doc, colonnes, lignes) {
  const x = doc.page.margins.left;
  const basDePage = doc.page.height - doc.page.margins.bottom;
  let y = doc.y;

  dessinerEntete(doc, colonnes, x, y);
  y += HAUTEUR_ENTETE;

  lignes.forEach((creneau) => {
    if (y + HAUTEUR_LIGNE > basDePage) {
      doc.addPage();
      y = doc.page.margins.top;
      dessinerEntete(doc, colonnes, x, y);
      y += HAUTEUR_ENTETE;
    }
    dessinerLigne(doc, colonnes, creneau, x, y);
    y += HAUTEUR_LIGNE;
  });

  doc.y = y;
}

// colonnesSupplementaires permet d'omettre la colonne redondante avec le sujet du PDF
// (ex: pas de colonne "Classe" sur le PDF d'UNE classe donnée).
function construireColonnes(largeurUtile, { avecClasse, avecProfesseur }) {
  const colonnesBase = [
    { titre: 'Jour', poids: 1.1, valeur: (c) => c.jour },
    { titre: 'Heure', poids: 1.3, valeur: (c) => `${c.heureDebut} – ${c.heureFin}` },
    { titre: 'Matière', poids: 1.6, valeur: (c) => c.matiere?.nom || '—' },
  ];
  if (avecProfesseur) {
    colonnesBase.push({ titre: 'Professeur', poids: 1.6, valeur: (c) => (c.professeur ? `${c.professeur.prenom} ${c.professeur.nom}` : '—') });
  }
  if (avecClasse) {
    colonnesBase.push({ titre: 'Classe', poids: 1.2, valeur: (c) => c.classe?.nom || '—' });
  }
  colonnesBase.push({ titre: 'Salle', poids: 1.2, valeur: (c) => c.salle?.nom || '—' });

  const poidsTotal = colonnesBase.reduce((somme, col) => somme + col.poids, 0);
  return colonnesBase.map((col) => ({ ...col, largeur: (col.poids / poidsTotal) * largeurUtile }));
}

function genererPdfEmploiDuTemps({ titre, sousTitre, creneaux, avecClasse = true, avecProfesseur = true }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const morceaux = [];

    doc.on('data', (morceau) => morceaux.push(morceau));
    doc.on('end', () => resolve(Buffer.concat(morceaux)));
    doc.on('error', reject);

    doc.fontSize(18).font('Helvetica-Bold').text(titre, { align: 'center' });
    if (sousTitre) {
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(sousTitre, { align: 'center' });
      doc.fillColor('#000');
    }
    doc.moveDown(1);

    const lignesTriees = [...creneaux].sort((a, b) => {
      const diffJour = JOURS_SEMAINE.indexOf(a.jour) - JOURS_SEMAINE.indexOf(b.jour);
      return diffJour !== 0 ? diffJour : a.heureDebut.localeCompare(b.heureDebut);
    });

    const largeurUtile = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colonnes = construireColonnes(largeurUtile, { avecClasse, avecProfesseur });

    if (lignesTriees.length === 0) {
      doc.fontSize(11).font('Helvetica-Oblique').fillColor('#888').text('Aucun créneau programmé.');
    } else {
      dessinerTableau(doc, colonnes, lignesTriees);
    }

    doc.end();
  });
}

module.exports = { genererPdfEmploiDuTemps };
