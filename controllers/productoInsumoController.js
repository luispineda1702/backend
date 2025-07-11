const db = require('../config/db');

// Obtener insumos por producto (pizza)
exports.getInsumosPorProducto = (req, res) => {
  const { producto_id } = req.params;
  const sql = `
    SELECT i.id, i.nombre, i.descripcion, pi.cantidad
    FROM producto_insumos pi
    JOIN insumos i ON i.id = pi.insumo_id
    WHERE pi.producto_id = ?
  `;
  db.query(sql, [producto_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener insumos del producto' });
    res.json(result);
  });
};

// Agregar insumo a un producto
exports.agregarInsumo = (req, res) => {
  const { producto_id, insumo_id, cantidad } = req.body;
  const sql = 'INSERT INTO producto_insumos (producto_id, insumo_id, cantidad) VALUES (?, ?, ?)';
  db.query(sql, [producto_id, insumo_id, cantidad], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al agregar insumo al producto' });
    res.json({ message: 'Insumo agregado correctamente' });
  });
};

// Eliminar insumo de un producto
exports.eliminarInsumo = (req, res) => {
  const { producto_id, insumo_id } = req.params;
  const sql = 'DELETE FROM producto_insumos WHERE producto_id = ? AND insumo_id = ?';
  db.query(sql, [producto_id, insumo_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar insumo del producto' });
    res.json({ message: 'Insumo eliminado correctamente' });
  });
};
