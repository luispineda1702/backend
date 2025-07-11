const db = require('../config/db');

// Obtener todos los productos por promoción
exports.getProductosByPromocion = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT pp.*, p.nombre AS producto_nombre
    FROM promociones_productos pp
    JOIN pizzas p ON pp.tipo_producto = 'pizza' AND pp.producto_id = p.id
    WHERE pp.promocion_id = ?
    UNION
    SELECT pp.*, i.nombre AS producto_nombre
    FROM promociones_productos pp
    JOIN insumos i ON pp.tipo_producto = 'gaseosa' AND pp.producto_id = i.id
    WHERE pp.promocion_id = ?
  `;

  db.query(sql, [id, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos de la promoción' });
    res.status(200).json(results);
  });
};

// Añadir producto a promoción
exports.addProductoToPromocion = (req, res) => {
  const { promocion_id, producto_id, tipo_producto, cantidad } = req.body;

  if (!['pizza', 'gaseosa'].includes(tipo_producto)) {
    return res.status(400).json({ error: 'Tipo de producto inválido' });
  }

  const sql = `
    INSERT INTO promociones_productos (promocion_id, producto_id, tipo_producto, cantidad)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [promocion_id, producto_id, tipo_producto, cantidad], (err) => {
    if (err) return res.status(500).json({ error: 'Error al añadir producto a la promoción' });
    res.status(200).json({ message: 'Producto añadido a la promoción correctamente' });
  });
};

// Eliminar un producto de una promoción
exports.removeProductoFromPromocion = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM promociones_productos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar producto de la promoción' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(200).json({ message: 'Producto eliminado de la promoción correctamente' });
  });
};
