const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Función para generar código único
function generarCodigo(nombre, apellido) {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return nombre.substring(0, 2).toUpperCase() + apellido.substring(0, 2).toUpperCase() + randomNum;
}

// Obtener todos los repartidores con nombre de zona
exports.getAllRepartidores = (req, res) => {
  const sql = `
    SELECT r.id, r.nombre, r.apellido, r.codigo, z.nombre AS zona, r.rol, r.estado, r.disponible
    FROM repartidores r
    LEFT JOIN zonas z ON r.zona_id = z.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener repartidores' });
    res.json(results);
  });
};

// Registrar repartidor
exports.registerRepartidor = (req, res) => {
  const { nombre, apellido, clave, zona_id } = req.body;

  if (!nombre || !apellido || !clave || !zona_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const codigo = generarCodigo(nombre, apellido);

  bcrypt.hash(clave, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error al encriptar la contraseña' });

    const sql = `
      INSERT INTO repartidores (nombre, apellido, codigo, clave, zona_id, rol, estado, disponible)
      VALUES (?, ?, ?, ?, ?, 'repartidor', 'Activo', 'Si')
    `;
    db.query(sql, [nombre, apellido, codigo, hash, zona_id], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Código repetido, intenta de nuevo' });
        }
        return res.status(500).json({ error: 'Error al registrar repartidor' });
      }
      res.status(201).json({
        message: 'Repartidor registrado correctamente',
        repartidorId: result.insertId,
        codigo
      });
    });
  });
};

// Actualizar repartidor
exports.updateRepartidor = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, estado, disponible, zona_id } = req.body;

  const sql = `
    UPDATE repartidores
    SET nombre = ?, apellido = ?, estado = ?, disponible = ?, zona_id = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, apellido, estado, disponible, zona_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar repartidor' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Repartidor no encontrado' });

    res.json({ message: 'Repartidor actualizado correctamente' });
  });
};

// Eliminar repartidor
exports.deleteRepartidor = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM repartidores WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar repartidor' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Repartidor no encontrado' });

    res.json({ message: 'Repartidor eliminado correctamente' });
  });
};

// controllers/repartidorController.js
exports.getRepartidoresDisponiblesPorZona = (req, res) => {
  const { zonaId } = req.params;

  const sql = `
    SELECT id, nombre 
    FROM repartidores 
    WHERE zona_id = ? AND estado = 'Activo' AND disponible = 'Si'
  `;

  db.query(sql, [zonaId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener repartidores' });
    res.status(200).json(results);
  });
};

exports.actualizarDisponibilidadRepartidor = (req, res) => {
  const { repartidorId } = req.params;
  const { disponible } = req.body; // Espera 'Si' o 'No'

  const sql = 'UPDATE repartidores SET disponible = ? WHERE id = ?';

  db.query(sql, [disponible, repartidorId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar disponibilidad' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Repartidor no encontrado' });

    res.status(200).json({ message: 'Disponibilidad actualizada correctamente' });
  });
};

exports.actualizarEstadoRepartidor = (req, res) => {
  const { repartidorId } = req.params;
  const { estado } = req.body; // 'activo' o 'desactivado'

  if (!['activo', 'desactivado'].includes(estado.toLowerCase())) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser "activo" o "desactivado".' });
  }

  const sql = 'UPDATE repartidores SET estado = ? WHERE id = ?';

  db.query(sql, [estado.toLowerCase(), repartidorId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar estado' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Repartidor no encontrado' });

    res.status(200).json({ message: 'Estado actualizado correctamente' });
  });
};

// controllers/repartidorController.js

exports.loginRepartidor = (req, res) => {
  const { codigo, clave } = req.body;

  if (!codigo || !clave) {
    return res.status(400).json({ error: 'Código y clave son obligatorios' });
  }

  const sql = 'SELECT * FROM repartidores WHERE codigo = ?';
  db.query(sql, [codigo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Código no registrado' });

    const repartidor = results[0];

    bcrypt.compare(clave, repartidor.clave, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error al verificar clave' });
      if (!isMatch) return res.status(401).json({ error: 'Clave incorrecta' });

      res.json({
        id: repartidor.id,
        nombre: repartidor.nombre,
        apellido: repartidor.apellido,
        codigo: repartidor.codigo,
        zona_id: repartidor.zona_id,
        rol: repartidor.rol,
      });
    });
  });
};

