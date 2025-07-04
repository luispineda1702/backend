const express = require('express');
const router = express.Router();
const pizzasModel = require('../models/pizzasModel');

// Obtener todas las pizzas
router.get('/', (req, res) => {
  pizzasModel.getAllPizzas((err, results) => {
    if (err) {
      console.error('Error al obtener pizzas:', err);
      return res.status(500).json({ error: 'Error interno' });
    }

    res.json(results);
  });
});

// Obtener pizza por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  pizzasModel.obtenerPizzaPorId(id, (err, pizza) => {
    if (err) {
      console.error('Error al obtener pizza:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }

    if (!pizza) {
      return res.status(404).json({ message: 'Pizza no encontrada' });
    }

    res.json(pizza);
  });
});

module.exports = router;
