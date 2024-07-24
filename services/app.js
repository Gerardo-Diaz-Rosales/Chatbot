const express = require('express');
const bodyParser = require('body-parser');
const botRoutes = require('./src/routes/messageRoutes');
const cors = require('cors');
const { botReadyPromise } = require('./src/bot');

const app = express();
const port = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(bodyParser.json());

// Usar las rutas del bot
app.use('/api', botRoutes);

// Iniciar el servidor después de que el bot esté listo
botReadyPromise.then(() => {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Error al inicializar el bot:', error);
});