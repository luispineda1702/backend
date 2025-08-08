// routes/pizzaRoutes.js
const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');

router.get('/', pizzaController.getAllPizzas);
router.post('/', pizzaController.createPizza);
router.put('/:id', pizzaController.updatePizza);
router.delete('/:id', pizzaController.deletePizza);
router.get('/', pizzaController.getAllProductos);
router.get('/tipo/:tipo', pizzaController.getProductosPorTipo); // ← nuevo filtro
router.get('/:id', pizzaController.getPizzaById);

module.exports = router;
