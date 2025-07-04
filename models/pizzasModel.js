const db = require('../config/db');

const getAllPizzas = (callback) => {
  db.query('SELECT * FROM pizzas', callback);
};

const obtenerPizzaPorId = (id, callback) => {
  const query = 'SELECT * FROM pizzas WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]); // solo un resultado esperado
  });
};

module.exports = {
  getAllPizzas,
  obtenerPizzaPorId,
};
