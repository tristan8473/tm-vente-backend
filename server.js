const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Données de test en dur pour l'instant
const salons = [
  {
    id: 1,
    nom: "Salon de Printemps",
    ville: "Lyon",
    dateDebut: "2026-03-15",
    dateFin: "2026-03-17",
    caTotal: 3500
  },
  {
    id: 2,
    nom: "Salon Gourmand",
    ville: "Paris",
    dateDebut: "2026-04-10",
    dateFin: "2026-04-12",
    caTotal: 5200
  }
];

// Test API
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Liste des salons
app.get("/api/salons", (req, res) => {
  res.json(salons);
});

app.listen(PORT, () => {
  console.log("tm-vente backend listening on port " + PORT);
});