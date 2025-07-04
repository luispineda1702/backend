const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

router.post('/pedidos', pedidosController.crearPedido);
router.get('/pedidos/usuario/:usuarioId', pedidosController.obtenerPedidosPorUsuario);

module.exports = router;
