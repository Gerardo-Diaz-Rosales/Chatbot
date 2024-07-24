const express = require('express');
const router = express.Router();
const { getClient } = require('../bot');
const createConnection = require('../db');

// Ruta para obtener detalles de un cliente por ID
router.get('/client/:id', async (req, res) => {
    const clientId = req.params.id;
    const query = 'SELECT * FROM clients WHERE id = ?';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, [clientId]);
        if (results.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        res.json(results[0]);
    } catch (error) {
        return res.status(500).send('Error al obtener detalles del cliente: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta para obtener historial de conversaciones de un cliente por ID
router.get('/client/:id/conversations', async (req, res) => {
    const clientId = req.params.id;
    const query = 'SELECT * FROM conversations WHERE client_id = ?';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, [clientId]);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener historial de conversaciones: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta para obtener mensajes de una conversación específica
router.get('/conversation/:conversationId/messages', async (req, res) => {
    const conversationId = req.params.conversationId;
    const query = 'SELECT * FROM messages WHERE conversation_id = ?';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, [conversationId]);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener mensajes de la conversación: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta para enviar mensajes
router.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).send('Número y mensaje son requeridos.');
    }

    const formattedNumber = `${number}@c.us`;
    const client = getClient();
    if (!client) {
        return res.status(500).send('El cliente de Venom no está disponible.');
    }

    try {
        const result = await client.sendText(formattedNumber, message);
        console.log('Mensaje enviado: ', result);
        res.status(200).send('Mensaje enviado con éxito.');
    } catch (error) {
        console.error('Error al enviar mensaje: ', error);
        res.status(500).send('Error al enviar mensaje: ' + error.message);
    }
});


// Ruta para obtener clientes potenciales (is_cliente = 0)
router.get('/potential-clients', async (req, res) => {
    const query = 'SELECT * FROM clients WHERE is_cliente = 0';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener clientes potenciales: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta de prueba
router.get('/test', (req, res) => {
    res.send('Ruta de prueba funcionando');
});

module.exports = router;
