const express = require('express');
const router = express.Router();
const repartidorController = require('../controllers/repartidorController');

router.get('/', repartidorController.getAllRepartidores);
router.post('/', repartidorController.registerRepartidor);
router.put('/:id', repartidorController.updateRepartidor);
router.delete('/:id', repartidorController.deleteRepartidor);

module.exports = router;
