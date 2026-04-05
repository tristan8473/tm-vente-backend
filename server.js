const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// Configuration pour accepter les gros fichiers JSON
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sert l'application frontend depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Connexion automatique à la base de données Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// LA MAGIE EST ICI : Configuration automatique de la base au démarrage
async function initDB() {
  try {
    console.log("🛠️ Vérification et installation de la base de données...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
    await pool.query(`
      INSERT INTO app_state (id, data) 
      VALUES (1, '[]'::jsonb) 
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✅ Base de données prête et configurée !");
  } catch (err) {
    console.error("❌ Erreur d'initialisation de la base :", err);
  }
}
initDB();

// API : Lire les données (quand l'iPad ouvre l'app)
app.get('/api/sync', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM app_state WHERE id = 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0].data);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur BDD' });
  }
});

// API : Enregistrer les modifications (quand tu ajoutes un salon/visiteur)
app.post('/api/sync', async (req, res) => {
  try {
    const salons = req.body;
    await pool.query(
      'INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [JSON.stringify(salons)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur BDD' });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
