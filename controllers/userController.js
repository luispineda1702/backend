const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN
exports.login = (req, res) => {
  const { correo, clave } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    bcrypt.compare(clave, usuario.clave, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error al comparar claves' });

      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET || 'secreto',
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, apellido: usuario.apellido ,rol:usuario.rol,estado:usuario.estado,direccion:usuario.direccion},
        token,
      });
    });
  });
};

// REGISTRO 
exports.register = (req, res) => {
  const { nombre, apellido, correo, clave, direccion } = req.body;

  bcrypt.hash(clave, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

    const sql = 'INSERT INTO usuarios (nombre, apellido, correo, clave, direccion) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, apellido, correo, hash, direccion], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al registrar usuario' });

      res.status(200).json({ message: 'Usuario registrado exitosamente' });
    });
  });
};

// OBTENER TODOS LOS USUARIOS
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT id, nombre, apellido, correo, rol,estado,direccion FROM usuarios';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });

    res.status(200).json(results);
  });
};

// EDITAR
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, direccion, rol, estado } = req.body;

  const sql = `
    UPDATE usuarios
    SET nombre = ?, apellido = ?, correo = ?, direccion = ?, rol = ?, estado = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, apellido, correo, direccion, rol, estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  });
};

// ELIMINAR
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM usuarios WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  });
};

// ACTIVAR/DESACTIVAR USER
exports.toggleUserState = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // debe ser 'activo' o 'desactivado'

  if (!['activo', 'desactivado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const sql = 'UPDATE usuarios SET estado = ? WHERE id = ?';

  db.query(sql, [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al cambiar estado' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: `Usuario ${estado} correctamente` });
  });
};

// Obtener un usuario por ID
exports.getUserById = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT id, nombre, apellido, correo, rol, direccion, estado FROM usuarios WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el usuario' });
    if (result.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json(result[0]);
  });
};


