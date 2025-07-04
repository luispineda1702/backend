// routes/promociones.js
const express = require('express');
const router = express.Router();
const promocionesModel = require('../models/promocionesModel');

router.get('/', (req, res) => {
  promocionesModel.getAll((err, results) => {
    if (err) {
      console.error('Error al obtener promociones:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

module.exports = router;
