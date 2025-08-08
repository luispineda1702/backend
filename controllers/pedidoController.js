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

    if (etapa === 'Entregado') {
      const repartidorSql = 'SELECT repartidor_id FROM pedidos WHERE id = ?';
      db.query(repartidorSql, [id], (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Pedido actualizado, pero error al verificar repartidor' });

        const repartidorId = rows[0]?.repartidor_id;
        if (!repartidorId) return res.status(200).json({ message: 'Pedido entregado, sin repartidor asignado' });

        const liberarSql = 'UPDATE repartidores SET disponible = "Si" WHERE id = ?';
        db.query(liberarSql, [repartidorId], (err3) => {
          if (err3) return res.status(500).json({ error: 'Pedido entregado, pero error al liberar repartidor' });

          res.status(200).json({ message: 'Pedido entregado y repartidor liberado' });
        });
      });
    } else {
      res.status(200).json({ message: 'Pedido actualizado correctamente' });
    }
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

exports.getEtapaPedido = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT etapa FROM pedidos WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la etapa del pedido' });
    if (results.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.status(200).json({ etapa: results[0].etapa });
  });
};

exports.getConfirmadoPedido = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT confirmado FROM pedidos WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el estado de confirmación' });
    if (results.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.status(200).json({ confirmado: results[0].confirmado });
  });
};

exports.getZonaPedido = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT z.id AS zona_id, z.nombre AS zona_nombre
    FROM pedidos p
    JOIN direcciones_usuario d ON p.direccion_id = d.id
    JOIN zonas z ON d.zona_id = z.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener zona del pedido' });
    if (results.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.status(200).json(results[0]);
  });
};

exports.asignarPedidoARepartidor = (req, res) => {
  const { pedidoId, repartidorId } = req.body;

  // Paso 1: Obtener zona del pedido
  const sqlZonaPedido = `
    SELECT z.id AS zona_id
    FROM pedidos p
    JOIN direcciones_usuario d ON p.direccion_id = d.id
    JOIN zonas z ON d.zona_id = z.id
    WHERE p.id = ?
  `;

  db.query(sqlZonaPedido, [pedidoId], (err, pedidoResults) => {
    if (err) return res.status(500).json({ error: 'Error al obtener zona del pedido' });
    if (pedidoResults.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    const zonaPedidoId = pedidoResults[0].zona_id;

    // Paso 2: Verificar repartidor (zona, estado y disponibilidad)
    const sqlRepartidor = `
      SELECT id FROM repartidores 
      WHERE id = ? AND zona_id = ? AND estado = 'Activo' AND disponible = 'Si'
    `;

    db.query(sqlRepartidor, [repartidorId, zonaPedidoId], (err2, repartidorResults) => {
      if (err2) return res.status(500).json({ error: 'Error al verificar repartidor' });
      if (repartidorResults.length === 0) {
        return res.status(400).json({ error: 'Repartidor no disponible o no corresponde a la zona del pedido' });
      }

      // Paso 3: Asignar pedido al repartidor
      const sqlAsignar = 'UPDATE pedidos SET repartidor_id = ?, etapa = "Reparto", confirmado = "Si" WHERE id = ?';
      db.query(sqlAsignar, [repartidorId, pedidoId], (err3, result) => {
        if (err3) return res.status(500).json({ error: 'Error al asignar pedido' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        // Paso 4: Actualizar disponibilidad repartidor
        const sqlUpdateDisp = 'UPDATE repartidores SET disponible = "No" WHERE id = ?';
        db.query(sqlUpdateDisp, [repartidorId], (err4) => {
          if (err4) return res.status(500).json({ error: 'Pedido asignado, pero error al actualizar disponibilidad' });

          res.status(200).json({ message: 'Pedido asignado correctamente' });
        });
      });
    });
  });
};

exports.crearPedido = (req, res) => {
  const { usuario_id, direccion_id, metodo_pago, total, productos } = req.body;

  if (!usuario_id || !direccion_id || !metodo_pago || !total || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Datos incompletos o productos inválidos' });
  }

  // 1. Insertar pedido
  const sqlPedido = `INSERT INTO pedidos (usuario_id, direccion_id, metodo_pago, total, fecha) VALUES (?, ?, ?, ?, NOW())`;

  db.query(sqlPedido, [usuario_id, direccion_id, metodo_pago, total], (err, result) => {
    if (err) {
      console.error('Error al insertar pedido:', err);
      return res.status(500).json({ error: 'Error al registrar el pedido' });
    }

    const pedido_id = result.insertId;

    // 2. Insertar productos del pedido uno por uno
    const sqlDetalle = `INSERT INTO pedido_detalle (pedido_id, tipo, producto_nombre, cantidad, masa, ingredientes_extra, total) VALUES ?`;

    const valores = productos.map(p => [
      pedido_id,
      p.tipo,
      p.producto_nombre,
      p.cantidad,
      p.masa,
      p.ingredientes_extra || '',
      p.total
    ]);

    db.query(sqlDetalle, [valores], (err2, result2) => {
      if (err2) {
        console.error('Error al insertar detalles:', err2);
        return res.status(500).json({ error: 'Error al registrar los detalles del pedido' });
      }

      res.status(201).json({ mensaje: 'Pedido registrado correctamente', pedido_id });
    });
  });
};

// Mostrar todos los pedidos NO ASIGNADOS para la zona del repartidor
exports.obtenerPedidosPorZona = (req, res) => {
  const { zonaId } = req.params;

  const sql = `
    SELECT p.*, d.descripcion AS direccion, u.nombre AS usuario
    FROM pedidos p
    JOIN direcciones_usuario d ON p.direccion_id = d.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE d.zona_id = ? AND p.confirmado = 'Si' AND p.repartidor_id IS NULL
    ORDER BY p.fecha DESC
  `;

  db.query(sql, [zonaId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos por zona' });
    res.json(result);
  });
};

exports.updateEtapaPedido = (req, res) => {
  const { id } = req.params;
  const { etapa } = req.body;

  if (!etapa) {
    return res.status(400).json({ error: 'La etapa es requerida' });
  }

  const sql = 'UPDATE pedidos SET etapa = ? WHERE id = ?';

  db.query(sql, [etapa, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar la etapa del pedido' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.status(200).json({ message: 'Etapa actualizada correctamente' });
  });
};

exports.asignarRepartidor = (req, res) => {
  const { id } = req.params; // id del pedido
  const { repartidorId } = req.body;

  if (!repartidorId) {
    return res.status(400).json({ error: 'El ID del repartidor es requerido' });
  }

  // Verificar si el repartidor existe
  const checkRepartidorSQL = 'SELECT id FROM repartidores WHERE id = ?';
  db.query(checkRepartidorSQL, [repartidorId], (err, repartidorResult) => {
    if (err) return res.status(500).json({ error: 'Error al buscar repartidor' });
    if (repartidorResult.length === 0) {
      return res.status(404).json({ error: 'Repartidor no encontrado' });
    }

    // Asignar repartidor al pedido
    const updateSQL = 'UPDATE pedidos SET repartidor_id = ? WHERE id = ?';
    db.query(updateSQL, [repartidorId, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al asignar el repartidor al pedido' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.status(200).json({ message: 'Repartidor asignado correctamente al pedido' });
    });
  });
};

// pedidos en reparto asignados al repartidor
exports.obtenerPedidosEnReparto = (req, res) => {
  const { repartidorId } = req.params;

  const sql = `
    SELECT p.*, d.descripcion AS direccion, u.nombre AS usuario
    FROM pedidos p
    JOIN direcciones_usuario d ON p.direccion_id = d.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.repartidor_id = ?
      AND p.etapa = 'Reparto'
    ORDER BY p.fecha DESC
  `;

  db.query(sql, [repartidorId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos en reparto' });
    res.json(result);
  });
};

exports.obtenerPedidosPorUsuario = (req, res) => {
  const { usuarioId } = req.params;

  const sql = `
  SELECT p.*, d.descripcion AS direccion, z.nombre AS zona
  FROM pedidos p
  LEFT JOIN direcciones_usuario d ON p.direccion_id = d.id
  LEFT JOIN zonas z ON d.zona_id = z.id
  WHERE p.usuario_id = ?
  ORDER BY p.fecha DESC
`;

db.query(sql, [usuarioId], (err, results) => {
  if (err) {
    console.error('Error en la consulta SQL:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
    return;
  }
  res.json(results);
});
};

exports.crearPedidoCompleto = (req, res) => {
  const {
    usuario_id,
    direccion_id,
    metodo_pago,
    total,
    items, // array de items, cada uno con tipo, pizza_id, promocion_id, cantidad, masa, ingredientes_extra
  } = req.body;

  if (!usuario_id || !direccion_id || !metodo_pago || !total || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  // Insumos base obligatorios en toda pizza
  const insumosBase = ['Salsa de tomate', 'Queso mozzarella'];

  // Validar stock pizza normal (base y masa no aquí, se validan aparte)
  function validarStockProducto(pizza_id, cantidad, callback) {
    const sql = `
      SELECT i.id, i.cantidad_actual
      FROM insumos i
      JOIN producto_insumos pi ON i.id = pi.insumo_id
      WHERE pi.pizza_id = ?`;
    db.query(sql, [pizza_id], (err, results) => {
      if (err) {
        console.error('Error en validarStockProducto:', err);
        return callback(err);
      }
      for (const insumo of results) {
        if (insumo.cantidad_actual < cantidad) {
          return callback(null, false, `Insuficiente stock para insumo ID ${insumo.id}`);
        }
      }
      callback(null, true);
    });
  }

  // Validar stock insumo masa (por nombre)
  function validarStockMasa(nombreMasa, cantidad, callback) {
    if (!nombreMasa) return callback(null, true); // masa no definida no valida
    db.query(`SELECT cantidad_actual FROM insumos WHERE nombre = ?`, [nombreMasa], (err, results) => {
      if (err) {
        console.error('Error en validarStockMasa:', err);
        return callback(err);
      }
      if (results.length === 0 || results[0].cantidad_actual < cantidad) {
        return callback(null, false, `Insuficiente stock para masa ${nombreMasa}`);
      }
      callback(null, true);
    });
  }

  // Validar stock insumos base obligatorios
  function validarStockInsumosBase(cantidad, callback) {
    let i = 0;
    function next() {
      if (i === insumosBase.length) return callback(null, true);
      const nombre = insumosBase[i];
      db.query(`SELECT cantidad_actual FROM insumos WHERE nombre = ?`, [nombre], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0 || results[0].cantidad_actual < cantidad) {
          return callback(null, false, `Insuficiente stock para insumo base ${nombre}`);
        }
        i++;
        next();
      });
    }
    next();
  }

  // Validar stock ingredientes extra (array de ids)
  function validarStockIngredientesExtra(ingredientes_extra, cantidad, callback) {
    if (!Array.isArray(ingredientes_extra)) return callback(null, true);
    let i = 0;
    function next() {
      if (i === ingredientes_extra.length) return callback(null, true);
      const id = ingredientes_extra[i];
      db.query(`SELECT cantidad_actual FROM insumos WHERE id = ?`, [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0 || results[0].cantidad_actual < cantidad) {
          return callback(null, false, `Insuficiente stock para ingrediente extra ID ${id}`);
        }
        i++;
        next();
      });
    }
    next();
  }

  // Validar stock promoción (sin multiplicador)
  function validarStockPromocion(promocion_id, cantidad, callback) {
    const sql = `SELECT pizzas_id FROM promociones_productos WHERE promociones_id = ?`;
    db.query(sql, [promocion_id], (err, productos) => {
      if (err) {
        console.error('Error en validarStockPromocion:', err);
        return callback(err);
      }
      let i = 0;
      function next() {
        if (i === productos.length) return callback(null, true);
        validarStockProducto(productos[i].pizzas_id, cantidad, (err, valido, mensaje) => {
          if (err) return callback(err);
          if (!valido) return callback(null, false, mensaje);
          i++;
          next();
        });
      }
      next();
    });
  }

  // Reducir stock pizza normal
  function reducirStockPorPizza(pizza_id, cantidad, cb) {
    const sql = `SELECT insumo_id FROM producto_insumos WHERE pizza_id = ?`;
    db.query(sql, [pizza_id], (err, insumos) => {
      if (err) return cb(err);
      let i = 0;
      function next() {
        if (i === insumos.length) return cb(null);
        const insumo = insumos[i];
        const updateSql = `UPDATE insumos SET cantidad_actual = cantidad_actual - ? WHERE id = ?`;
        db.query(updateSql, [cantidad, insumo.insumo_id], (err) => {
          if (err) return cb(err);
          i++;
          next();
        });
      }
      next();
    });
  }

  // Reducir stock masa
  function reducirStockMasa(nombreMasa, cantidad, callback) {
    if (!nombreMasa) return callback(null);
    db.query(`UPDATE insumos SET cantidad_actual = cantidad_actual - ? WHERE nombre = ?`, [cantidad, nombreMasa], callback);
  }

  // Reducir stock insumos base
  function reducirStockInsumosBase(cantidad, callback) {
    let i = 0;
    function next() {
      if (i === insumosBase.length) return callback(null);
      const nombre = insumosBase[i];
      db.query(`UPDATE insumos SET cantidad_actual = cantidad_actual - ? WHERE nombre = ?`, [cantidad, nombre], (err) => {
        if (err) return callback(err);
        i++;
        next();
      });
    }
    next();
  }

  // Reducir stock ingredientes extra
  function reducirStockPorIngredientes(ingredientes_extra, cantidad, cb) {
    if (!Array.isArray(ingredientes_extra)) return cb(null);
    let i = 0;
    function next() {
      if (i === ingredientes_extra.length) return cb(null);
      const ingrediente_id = ingredientes_extra[i];
      db.query(`UPDATE insumos SET cantidad_actual = cantidad_actual - ? WHERE id = ?`, [cantidad, ingrediente_id], (err) => {
        if (err) return cb(err);
        i++;
        next();
      });
    }
    next();
  }

  // Reducir stock promoción (sin multiplicador)
  function reducirStockPorPromocion(promocion_id, cantidad, cb) {
    const sql = `SELECT pizzas_id FROM promociones_productos WHERE promociones_id = ?`;
    db.query(sql, [promocion_id], (err, productos) => {
      if (err) return cb(err);
      let i = 0;
      function next() {
        if (i === productos.length) return cb(null);
        reducirStockPorPizza(productos[i].pizzas_id, cantidad, (err) => {
          if (err) return cb(err);
          i++;
          next();
        });
      }
      next();
    });
  }

  // Validar pizza personalizada (incluye pizza base + masa + insumos base + ingredientes extra)
  function validarStockPizzaCompleta(pizza_id, masaNombre, ingredientes_extra, cantidad, callback) {
    validarStockProducto(pizza_id, cantidad, (err, valido, msg) => {
      if (err) return callback(err);
      if (!valido) return callback(null, false, msg);

      validarStockMasa(masaNombre, cantidad, (err, valido, msg) => {
        if (err) return callback(err);
        if (!valido) return callback(null, false, msg);

        validarStockInsumosBase(cantidad, (err, valido, msg) => {
          if (err) return callback(err);
          if (!valido) return callback(null, false, msg);

          validarStockIngredientesExtra(ingredientes_extra, cantidad, callback);
        });
      });
    });
  }

  // Reducir stock pizza personalizada (pizza base + masa + insumos base + ingredientes extra)
  function reducirStockPizzaCompleta(pizza_id, masaNombre, ingredientes_extra, cantidad, cb) {
    reducirStockPorPizza(pizza_id, cantidad, (err) => {
      if (err) return cb(err);
      reducirStockMasa(masaNombre, cantidad, (err) => {
        if (err) return cb(err);
        reducirStockInsumosBase(cantidad, (err) => {
          if (err) return cb(err);
          reducirStockPorIngredientes(ingredientes_extra, cantidad, cb);
        });
      });
    });
  }

  // Validar todos los items en el pedido
  function validarStockItems(index = 0) {
    if (index === items.length) return insertarPedido();
    const item = items[index];

    if (item.tipo === 'normal') {
      validarStockPizzaCompleta(item.pizza_id, item.masa, [], item.cantidad, (err, valido, msg) => {
        if (err) {
          console.error('Error validando stock pizza normal:', err);
          return res.status(500).json({ error: 'Error validando stock' });
        }
        if (!valido) return res.status(400).json({ error: msg });
        validarStockItems(index + 1);
      });
    } else if (item.tipo === 'promocion') {
      validarStockPromocion(item.promocion_id, item.cantidad, (err, valido, msg) => {
        if (err) {
          console.error('Error validando stock promocion:', err);
          return res.status(500).json({ error: 'Error validando stock' });
        }
        if (!valido) return res.status(400).json({ error: msg });
        validarStockItems(index + 1);
      });
    } else if (item.tipo === 'personalizada') {
      validarStockPizzaCompleta(item.pizza_id, item.masa, item.ingredientes_extra, item.cantidad, (err, valido, msg) => {
        if (err) {
          console.error('Error validando stock pizza personalizada:', err);
          return res.status(500).json({ error: 'Error validando stock' });
        }
        if (!valido) return res.status(400).json({ error: msg });
        validarStockItems(index + 1);
      });
    } else {
      validarStockItems(index + 1);
    }
  }

  // Insertar pedido y detalles, y reducir stock
  function insertarPedido() {
    const sqlInsertPedido = `
      INSERT INTO pedidos (usuario_id, direccion_id, metodo_pago, total, etapa, confirmado, fecha)
      VALUES (?, ?, ?, ?, 'Preparación', 'No', NOW())`;

    db.query(sqlInsertPedido, [usuario_id, direccion_id, metodo_pago, total], (err, pedidoResult) => {
      if (err) {
        console.error('Error insertando pedido:', err);
        return res.status(500).json({ error: 'Error al crear pedido' });
      }
      const pedidoId = pedidoResult.insertId;
      let idx = 0;

      function insertarDetalles() {
        if (idx === items.length) {
          return res.status(201).json({ mensaje: 'Pedido creado con éxito', pedidoId });
        }
        const item = items[idx];
        const sqlDetalle = `
          INSERT INTO pedido_detalle (pedido_id, tipo, producto_nombre, cantidad, masa, ingredientes_extra, total)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sqlDetalle, [
          pedidoId,
          item.tipo,
          item.producto_nombre,
          item.cantidad,
          item.masa || null,
          item.tipo === 'personalizada' ? JSON.stringify(item.ingredientes_extra) : null,
          item.total || null
        ], (err) => {
          if (err) {
            console.error('Error insertando detalle:', err);
            return res.status(500).json({ error: 'Error al insertar detalle del pedido' });
          }
          // Reducir stock según tipo
          if (item.tipo === 'normal') {
            reducirStockPizzaCompleta(item.pizza_id, item.masa, [], item.cantidad, (err) => {
              if (err) {
                console.error('Error reduciendo stock pizza:', err);
                return res.status(500).json({ error: 'Error reduciendo stock pizza' });
              }
              idx++;
              insertarDetalles();
            });
          } else if (item.tipo === 'promocion') {
            reducirStockPorPromocion(item.promocion_id, item.cantidad, (err) => {
              if (err) {
                console.error('Error reduciendo stock promocion:', err);
                return res.status(500).json({ error: 'Error reduciendo stock promocion' });
              }
              idx++;
              insertarDetalles();
            });
          } else if (item.tipo === 'personalizada') {
            reducirStockPizzaCompleta(item.pizza_id, item.masa, item.ingredientes_extra, item.cantidad, (err) => {
              if (err) {
                console.error('Error reduciendo stock pizza personalizada:', err);
                return res.status(500).json({ error: 'Error reduciendo stock pizza personalizada' });
              }
              idx++;
              insertarDetalles();
            });
          } else {
            idx++;
            insertarDetalles();
          }
        });
      }
      insertarDetalles();
    });
  }

  validarStockItems();
};

