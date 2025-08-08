const db = require('../config/db');

// Obtener direcciones por usuario
exports.getDireccionesUsuario = (req, res) => {
  const { usuarioId } = req.params;
  const sql = `
    SELECT d.id, d.descripcion, z.nombre AS zona 
    FROM direcciones_usuario d
    JOIN zonas z ON d.zona_id = z.id
    WHERE d.usuario_id = ?
  `;
  db.query(sql, [usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener direcciones' });
    res.json(results);
  });
};

// Registrar nueva dirección
exports.addDireccion = (req, res) => {
  // Los nombres deben coincidir con lo que envíe el frontend
  const { usuario_id, zona_id, descripcion } = req.body;
  
  if (!usuario_id || !zona_id || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = 'INSERT INTO direcciones_usuario (usuario_id, zona_id, descripcion) VALUES (?, ?, ?)';
  db.query(sql, [usuario_id, zona_id, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al agregar dirección' });
    res.status(201).json({ message: 'Dirección registrada', direccionId: result.insertId });
  });
};

// Editar una dirección existente
exports.updateDireccion = (req, res) => {
  const { id } = req.params;
  const { zona_id, descripcion } = req.body;

  if (!zona_id || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = 'UPDATE direcciones_usuario SET zona_id = ?, descripcion = ? WHERE id = ?';
  db.query(sql, [zona_id, descripcion, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar dirección' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dirección no encontrada' });

    res.status(200).json({ message: 'Dirección actualizada correctamente' });
  });
};

// Eliminar una dirección por su ID
exports.deleteDireccion = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM direcciones_usuario WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar dirección' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dirección no encontrada' });

    res.status(200).json({ message: 'Dirección eliminada correctamente' });
  });
};

// Obtener una dirección por su ID
exports.getDireccionById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT d.id, d.descripcion, z.nombre AS zona 
    FROM direcciones_usuario d
    JOIN zonas z ON d.zona_id = z.id
    WHERE d.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la dirección' });
    if (results.length === 0) return res.status(404).json({ error: 'Dirección no encontrada' });

    res.status(200).json(results[0]);
  });
};





