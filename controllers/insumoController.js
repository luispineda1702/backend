const db = require('../config/db');

// Obtener todos los insumos
exports.getInsumos = (req, res) => {
  db.query('SELECT * FROM insumos', (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener insumos' });
    res.json(result);
  });
};

// Crear un nuevo insumo
exports.createInsumo = (req, res) => {
  const { nombre, descripcion, cantidad_actual } = req.body;
  const sql = `INSERT INTO insumos (nombre, descripcion, cantidad_actual, fecha_actualizacion)
               VALUES (?, ?, ?, NOW())`;
  db.query(sql, [nombre, descripcion, cantidad_actual], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear insumo' });
    res.json({ message: 'Insumo creado correctamente' });
  });
};

// Actualizar insumo
exports.updateInsumo = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, cantidad_actual } = req.body;
  const sql = `UPDATE insumos
               SET nombre = ?, descripcion = ?, cantidad_actual = ?, fecha_actualizacion = NOW()
               WHERE id = ?`;
  db.query(sql, [nombre, descripcion, cantidad_actual, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar insumo' });
    res.json({ message: 'Insumo actualizado correctamente' });
  });
};

// Eliminar insumo
exports.deleteInsumo = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM insumos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar insumo' });
    res.json({ message: 'Insumo eliminado correctamente' });
  });
};
