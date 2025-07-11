const express = require('express');
const router = express.Router();
const controller = require('../controllers/productoInsumoController');

router.get('/:producto_id', controller.getInsumosPorProducto);
router.post('/', controller.agregarInsumo);
router.delete('/:producto_id/:insumo_id', controller.eliminarInsumo);

module.exports = router;
