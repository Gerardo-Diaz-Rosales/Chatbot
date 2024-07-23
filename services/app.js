// app.js
// Mantiene la configuración del servidor en express
const express = require('express');
const bodyParser = require('body-parser');
const botRoutes = require('./src/routes/messageRoutes');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(bodyParser.json());

// Usar las rutas del bot
app.use('/api', botRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
