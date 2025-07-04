const db = require('../config/db');

// Crear pedido
exports.crearPedido = (req, res) => {
  const { usuarioId, direccion, metodoPago, total, productos } = req.body;

  if (!usuarioId || !direccion || !metodoPago || total == null || !productos) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Asegurar que total sea número
  const totalNum = Number(total);
  if (isNaN(totalNum)) {
    return res.status(400).json({ error: 'Total debe ser un número válido' });
  }

  // Validar y convertir total en cada producto para evitar errores
  const productosValidados = productos.map(prod => ({
    ...prod,
    total: Number(prod.total) || 0, // Forzar número, 0 si no es válido
  }));

  const productosJSON = JSON.stringify(productosValidados);

  const sql = `INSERT INTO pedidos (usuarioId, direccion, metodoPago, total, productos, fecha)
               VALUES (?, ?, ?, ?, ?, NOW())`;

  db.query(sql, [usuarioId, direccion, metodoPago, totalNum, productosJSON], (err, result) => {
    if (err) {
      console.error('Error al crear pedido:', err);
      return res.status(500).json({ error: 'Error al crear el pedido' });
    }

    res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId: result.insertId });
  });
};

// Obtener pedidos por usuario
exports.obtenerPedidosPorUsuario = (req, res) => {
  const { usuarioId } = req.params;

  const sql = 'SELECT * FROM pedidos WHERE usuarioId = ? ORDER BY fecha DESC';

  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error('Error al obtener pedidos:', err);
      return res.status(500).json({ error: 'Error al obtener los pedidos' });
    }

    // Parsear JSON de productos y asegurar total numérico
    const pedidos = results.map(pedido => {
      let productosParsed = [];
      try {
        productosParsed = JSON.parse(pedido.productos).map(prod => ({
          ...prod,
          total: Number(prod.total) || 0,
        }));
      } catch (e) {
        console.error('Error al parsear productos:', e);
      }

      // Asegurar que total también sea numérico
      return {
        ...pedido,
        total: Number(pedido.total) || 0,
        productos: productosParsed,
      };
    });

    res.status(200).json(pedidos);
  });
};
