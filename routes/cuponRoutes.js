const express = require('express');
const router = express.Router();
const cuponController = require('../controllers/cuponController');

router.get('/', cuponController.getAllCupones);
router.post('/', cuponController.createCupon);
router.get('/:codigo', cuponController.getCuponByCodigo);
router.delete('/:id', cuponController.deleteCupon);

module.exports = router;
