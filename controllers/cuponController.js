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
// Cambiar estado del cupón (Activo/Inactivo)
exports.updateEstadoCupon = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const sql = 'UPDATE cupones SET estado = ? WHERE id = ?';
  db.query(sql, [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar el estado del cupón' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cupón no encontrado' });

    res.status(200).json({ message: `Estado del cupón actualizado a ${estado}` });
  });
};

exports.validarCupon = (req, res) => {
  const { codigo } = req.params;

  const sql = 'SELECT * FROM cupones WHERE codigo = ? AND estado = "Activo"';
  db.query(sql, [codigo], (err, results) => {
    if (err) {
      console.error("Error validar cupón:", err);
      return res.status(500).json({ valido: false, mensaje: "Error en el servidor." });
    }

    if (results.length === 0) {
      return res.json({ valido: false, mensaje: "Cupón inválido o no disponible." });
    }

    const cupon = results[0];
    return res.json({
      valido: true,
      descuento: parseFloat(cupon.descuento),
      descripcion: cupon.descripcion,
    });
  });
};

