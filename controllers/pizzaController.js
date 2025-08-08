const db = require('../config/db'); 
exports.getAllPizzas = (req, res) => {
  const sql = 'SELECT * FROM pizzas';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener las pizzas' });
    res.status(200).json(results);
  });
};
exports.createPizza = (req, res) => {
  const { nombre, tipo, precioBase, descripcion } = req.body;

  const sql = 'INSERT INTO pizzas (nombre, tipo, precioBase, descripcion) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, tipo, precioBase, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear la pizza' });
    res.status(200).json({ message: 'Pizza creada correctamente' });
  });
};
exports.updatePizza = (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, precioBase, descripcion } = req.body;

  const sql = `
    UPDATE pizzas
    SET nombre = ?, tipo = ?, precioBase = ?, descripcion = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, tipo, precioBase, descripcion, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar la pizza' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pizza no encontrada' });

    res.status(200).json({ message: 'Pizza actualizada correctamente' });
  });
};
exports.deletePizza = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM pizzas WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar la pizza' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pizza no encontrada' });

    res.status(200).json({ message: 'Pizza eliminada correctamente' });
  });
};


// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener productos por tipo (Familiar, Individual)
exports.getProductosPorTipo = async (req, res) => {
  const { tipo } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE tipo = ?', [tipo]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar productos' });
  }
};

// Obtener pizza por ID
exports.getPizzaById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM pizzas WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la pizza' });
    if (results.length === 0) return res.status(404).json({ error: 'Pizza no encontrada' });

    res.status(200).json(results[0]);
  });
};
