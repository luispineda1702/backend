const db = require('../config/db');

// Obtener detalles por pedido
exports.getDetallesByPedido = (req, res) => {
  const { pedido_id } = req.params;
  const sql = 'SELECT * FROM pedido_detalle WHERE pedido_id = ?';

  db.query(sql, [pedido_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener detalles' });
    res.json(results);
  });
};

// Crear detalle pedido
exports.createDetalle = (req, res) => {
  const {
    pedido_id,
    tipo,
    producto_nombre,
    cantidad,
    masa = null,
    ingredientes_extra = null,
    total,
  } = req.body;

  const sql = `
    INSERT INTO pedido_detalle (pedido_id, tipo, producto_nombre, cantidad, masa, ingredientes_extra, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [pedido_id, tipo, producto_nombre, cantidad, masa, ingredientes_extra, total], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear detalle' });

    res.json({ message: 'Detalle creado correctamente', id: result.insertId });
  });
};

// Actualizar detalle pedido (opcional)
exports.updateDetalle = (req, res) => {
  const { id } = req.params;
  const {
    tipo,
    producto_nombre,
    cantidad,
    masa,
    ingredientes_extra,
    total,
  } = req.body;

  const sql = `
    UPDATE pedido_detalle
    SET tipo = ?, producto_nombre = ?, cantidad = ?, masa = ?, ingredientes_extra = ?, total = ?
    WHERE id = ?
  `;

  db.query(sql, [tipo, producto_nombre, cantidad, masa, ingredientes_extra, total, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar detalle' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle no encontrado' });

    res.json({ message: 'Detalle actualizado correctamente' });
  });
};

// Eliminar detalle pedido (opcional)
exports.deleteDetalle = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM pedido_detalle WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar detalle' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle no encontrado' });

    res.json({ message: 'Detalle eliminado correctamente' });
  });
};
