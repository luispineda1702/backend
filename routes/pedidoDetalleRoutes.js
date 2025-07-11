const express = require('express');
const router = express.Router();
const pedidoDetalleController = require('../controllers/pedidoDetalleController');

router.get('/pedido/:pedido_id', pedidoDetalleController.getDetallesByPedido);
router.post('/', pedidoDetalleController.createDetalle);
router.put('/:id', pedidoDetalleController.updateDetalle);
router.delete('/:id', pedidoDetalleController.deleteDetalle);

module.exports = router;
