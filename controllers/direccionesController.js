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
  const { usuarioId, zonaId, descripcion } = req.body;
  const sql = 'INSERT INTO direcciones_usuario (usuario_id, zona_id, descripcion) VALUES (?, ?, ?)';
  db.query(sql, [usuarioId, zonaId, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al agregar dirección' });
    res.status(201).json({ message: 'Dirección registrada', direccionId: result.insertId });
  });
};
