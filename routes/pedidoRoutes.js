const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Rutas pedidos
router.get('/', pedidoController.getPedidos);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.delete('/:id', pedidoController.deletePedido);
router.get('/etapa/:id', pedidoController.getEtapaPedido);
router.get('/confirmado/:id', pedidoController.getConfirmadoPedido);
router.get('/zona/:id', pedidoController.getZonaPedido);
router.get('/zonaPedidos/:zonaId', pedidoController.obtenerPedidosPorZona);

router.put('/asignar', pedidoController.asignarPedidoARepartidor);
router.post('/prueba', pedidoController.crearPedido);

router.put('/etapa/:id', pedidoController.updateEtapaPedido);

router.put('/:id/asignar-repartidor', pedidoController.asignarRepartidor);

router.get('/repartidor/:repartidorId/en-reparto', pedidoController.obtenerPedidosEnReparto);

router.get('/usuario/:usuarioId', pedidoController.obtenerPedidosPorUsuario);

router.post('/completo', pedidoController.crearPedidoCompleto);


module.exports = router;
