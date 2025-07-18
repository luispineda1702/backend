const express = require('express');
const router = express.Router();
const direccionesController = require('../controllers/direccionesController');

router.get('/:usuarioId', direccionesController.getDireccionesUsuario);
router.post('/', direccionesController.addDireccion);

module.exports = router;
