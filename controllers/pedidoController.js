const db = require('../config/db');

// Obtener todos los pedidos (con usuario y cupón info)
exports.getPedidos = (req, res) => {
  const sql = `
    SELECT p.*, u.nombre AS usuario_nombre, c.titulo AS cupon_titulo
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN cupones c ON p.cupon_id = c.id
    ORDER BY p.fecha_creacion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos' });
    res.json(results);
  });
};

// Crear nuevo pedido
exports.createPedido = (req, res) => {
  const {
    usuario_id,
    direccion,
    metodoPago,
    total,
    etapa = 'preparacion',
    confirmacion = 'No',
    cupon_id = null
  } = req.body;

  const sql = `
    INSERT INTO pedidos (usuario_id, direccion, metodoPago, total, etapa, confirmacion, cupon_id, fecha_creacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [usuario_id, direccion, metodoPago, total, etapa, confirmacion, cupon_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear pedido' });

    res.json({ message: 'Pedido creado correctamente', pedido_id: result.insertId });
  });
};

// Actualizar pedido (puedes actualizar etapa, confirmacion, direccion, metodoPago, total, cupon_id)
exports.updatePedido = (req, res) => {
  const { id } = req.params;
  const { direccion, metodoPago, total, etapa, confirmacion, cupon_id } = req.body;

  const sql = `
    UPDATE pedidos
    SET direccion = ?, metodoPago = ?, total = ?, etapa = ?, confirmacion = ?, cupon_id = ?
    WHERE id = ?
  `;

  db.query(sql, [direccion, metodoPago, total, etapa, confirmacion, cupon_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar pedido' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ message: 'Pedido actualizado correctamente' });
  });
};

// Eliminar pedido
exports.deletePedido = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM pedidos WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar pedido' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ message: 'Pedido eliminado correctamente' });
  });
};
