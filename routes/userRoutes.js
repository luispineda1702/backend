const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAllUsers);

// Nueva ruta para actualizar usuario (editar)
router.put('/:id', userController.updateUser);

// Nueva ruta para eliminar usuario
router.delete('/:id', userController.deleteUser);

// Nueva ruta para activar / desactivar usuario
router.patch('/:id/estado', userController.toggleUserState);

module.exports = router;