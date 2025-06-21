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

    // Verificar la contraseña con bcrypt
    bcrypt.compare(clave, usuario.clave, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error al comparar claves' });

      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Si coincide, generar token
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET || 'secreto',
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
        token,
      });
    });
  });
};

// REGISTRO (por si aún no lo tienes)
exports.register = (req, res) => {
  const { nombre, apellido, correo, clave } = req.body;

  // Encriptar la contraseña
  bcrypt.hash(clave, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

    const sql = 'INSERT INTO usuarios (nombre, apellido, correo, clave) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, apellido, correo, hash], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al registrar usuario' });

      res.status(200).json({ message: 'Usuario registrado exitosamente' });
    });
  });
};

