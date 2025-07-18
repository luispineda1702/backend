const express = require('express');
const router = express.Router();
const zonasController = require('../controllers/zonasController');

router.get('/', zonasController.getZonas);

module.exports = router;
