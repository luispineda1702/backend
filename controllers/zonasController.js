const db = require('../config/db');

// Obtener zonas
exports.getZonas = (req, res) => {
  db.query('SELECT * FROM zonas', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener zonas' });
    res.json(results);
  });
};
