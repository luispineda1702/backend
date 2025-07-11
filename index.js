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
const userRoutes = require('./routes/userRoutes');
const pizzasRoutes = require('./routes/pizzaRoutes');
const promocionesRoutes = require('./routes/promocionRoutes');
const pedidosRoutes = require('./routes/pedidoRoutes');
const cuponRoutes = require('./routes/cuponRoutes');
const promoProdRoutes = require('./routes/promocionProductoRoutes');
const insumosRoutes = require('./routes/insumoRoutes');
const pedidoDetalleRoutes = require('./routes/pedidoDetalleRoutes');
const productoInsumoRoutes = require('./routes/productoInsumoRoutes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/pizzas', pizzasRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/cupones', cuponRoutes);
app.use('/api/promociones-productos', promoProdRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/pedido-detalle', pedidoDetalleRoutes);
app.use('/api/producto-insumos', productoInsumoRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

