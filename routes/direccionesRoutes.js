const express = require('express');
const router = express.Router();
const direccionesController = require('../controllers/direccionesController');

// Usamos rutas claras para evitar conflicto entre id y usuarioId
router.get('/usuario/:usuarioId', direccionesController.getDireccionesUsuario); // ✅
router.get('/:id', direccionesController.getDireccionById);

router.post('/', direccionesController.addDireccion);
router.put('/:id', direccionesController.updateDireccion);
router.delete('/:id', direccionesController.deleteDireccion);

module.exports = router;
