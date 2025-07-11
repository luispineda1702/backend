// routes/pizzaRoutes.js
const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');

router.get('/', pizzaController.getAllPizzas);
router.post('/', pizzaController.createPizza);
router.put('/:id', pizzaController.updatePizza);
router.delete('/:id', pizzaController.deletePizza);

module.exports = router;
