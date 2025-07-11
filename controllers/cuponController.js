
const db = require('../config/db'); 
exports.getAllCupones = (req, res) => {
  const sql = 'SELECT * FROM cupones';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cupones' });
    res.status(200).json(results);
  });
};
exports.createCupon = (req, res) => {
  const { codigo, descripcion, descuento, estado } = req.body;

  const sql = 'INSERT INTO cupones (codigo, descripcion, descuento, estado) VALUES (?, ?, ?, ?)';
  db.query(sql, [codigo, descripcion, descuento, estado], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar el cupón' });
    res.status(200).json({ message: 'Cupón registrado exitosamente' });
  });
};
exports.getCuponByCodigo = (req, res) => {
  const { codigo } = req.params;

  const sql = 'SELECT * FROM cupones WHERE codigo = ? AND estado = "Activo"';
  db.query(sql, [codigo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar cupón' });
    if (results.length === 0) return res.status(404).json({ error: 'Cupón no encontrado o inactivo' });

    res.status(200).json(results[0]);
  });
};
exports.deleteCupon = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM cupones WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar cupón' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cupón no encontrado' });

    res.status(200).json({ message: 'Cupón eliminado exitosamente' });
  });
};
