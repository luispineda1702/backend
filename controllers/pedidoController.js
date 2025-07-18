const db = require('../config/db');

// Obtener todos los pedidos (con usuario, cupón, dirección y zona)
exports.getPedidos = (req, res) => {
  const sql = `
    SELECT 
      p.*, 
      u.nombre AS usuario_nombre, 
      c.codigo AS cupon_codigo, 
      d.descripcion AS direccion, 
      z.nombre AS zona
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN cupones c ON p.cupon_id = c.id
    LEFT JOIN direcciones_usuario d ON p.direccion_id = d.id
    LEFT JOIN zonas z ON d.zona_id = z.id
    ORDER BY p.fecha DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos', detalles: err });
    res.json(results);
  });
};

// Crear nuevo pedido
exports.createPedido = (req, res) => {
  const {
    usuario_id,
    direccion_id,      // ahora enviamos id de la dirección, no texto
    metodo_pago,
    total,
    etapa = 'Preparación',
    confirmado = 'No',
    cupon_id = null
  } = req.body;

  const sql = `
    INSERT INTO pedidos (usuario_id, direccion_id, metodo_pago, total, etapa, confirmado, cupon_id, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [usuario_id, direccion_id, metodo_pago, total, etapa, confirmado, cupon_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear pedido', detalles: err });

    res.json({ message: 'Pedido creado correctamente', pedido_id: result.insertId });
  });
};

// Actualizar pedido
exports.updatePedido = (req, res) => {
  const { id } = req.params;
  const { direccion_id, metodo_pago, total, etapa, confirmado, cupon_id } = req.body;

  const sql = `
    UPDATE pedidos
    SET direccion_id = ?, metodo_pago = ?, total = ?, etapa = ?, confirmado = ?, cupon_id = ?
    WHERE id = ?
  `;

  db.query(sql, [direccion_id, metodo_pago, total, etapa, confirmado, cupon_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar pedido', detalles: err });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ message: 'Pedido actualizado correctamente' });
  });
};

// Eliminar pedido
exports.deletePedido = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM pedidos WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar pedido', detalles: err });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ message: 'Pedido eliminado correctamente' });
  });
};
