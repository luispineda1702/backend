const express = require('express');
const router = express.Router();
const repartidorController = require('../controllers/repartidorController');

router.get('/', repartidorController.getAllRepartidores);
router.post('/', repartidorController.registerRepartidor);
router.put('/:id', repartidorController.updateRepartidor);
router.delete('/:id', repartidorController.deleteRepartidor);

// Aquí agregamos el prefijo repartidorController.
router.get('/disponibles/:zonaId', repartidorController.getRepartidoresDisponiblesPorZona);
router.put('/disponible/:repartidorId', repartidorController.actualizarDisponibilidadRepartidor);
router.put('/estado/:repartidorId', repartidorController.actualizarEstadoRepartidor);
router.post('/login', repartidorController.loginRepartidor);


module.exports = router;
