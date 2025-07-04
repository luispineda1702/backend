// models/promocionesModel.js
const db = require('../config/db');

const promocionesModel = {
  getAll: (callback) => {
    const query = 'SELECT * FROM promociones';
    db.query(query, callback);
  }
};

module.exports = promocionesModel;
