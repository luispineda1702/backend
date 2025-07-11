// routes/promocionRoutes.js
const express = require('express');
const router = express.Router();
const promocionController = require('../controllers/promocionController');

router.get('/', promocionController.getAllPromociones);
router.post('/', promocionController.createPromocion);
router.put('/:id', promocionController.updatePromocion);
router.delete('/:id', promocionController.deletePromocion);

module.exports = router;
