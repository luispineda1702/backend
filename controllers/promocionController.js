const db = require('../config/db'); 
exports.getAllPromociones = (req, res) => {
  const sql = 'SELECT * FROM promociones';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener promociones' });
    res.status(200).json(results);
  });
};
exports.createPromocion = (req, res) => {
  const { titulo, descripcion, precio } = req.body;

  const sql = 'INSERT INTO promociones (titulo, descripcion, precio) VALUES (?, ?, ?)';
  db.query(sql, [titulo, descripcion, precio], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear promoción' });
    res.status(200).json({ message: 'Promoción creada correctamente' });
  });
};
exports.updatePromocion = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio } = req.body;

  const sql = `
    UPDATE promociones
    SET titulo = ?, descripcion = ?, precio = ?
    WHERE id = ?
  `;

  db.query(sql, [titulo, descripcion, precio, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar promoción' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Promoción no encontrada' });

    res.status(200).json({ message: 'Promoción actualizada correctamente' });
  });
};
exports.deletePromocion = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM promociones WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar promoción' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Promoción no encontrada' });

    res.status(200).json({ message: 'Promoción eliminada correctamente' });
  });
};
