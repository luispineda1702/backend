const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
res.send('API funcionando');
});

// Importar rutas
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

const pizzasRoutes = require('./routes/pizzas');
app.use('/api/pizzas', pizzasRoutes);

const promocionesRoutes = require('./routes/promociones');
app.use('/api/promociones', promocionesRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use(express.json());
app.use('/api', pedidosRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
