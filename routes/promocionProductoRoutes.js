const express = require('express');
const router = express.Router();
const controller = require('../controllers/promocionProductoController');

router.get('/:id', controller.getProductosByPromocion);
router.post('/', controller.addProductoToPromocion);
router.delete('/:id', controller.removeProductoFromPromocion);

module.exports = router;
