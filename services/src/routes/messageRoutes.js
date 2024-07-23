const express = require('express');
const router = express.Router();
const { getClient } = require('../bot');
const createConnection = require('../db');

// Ruta para obtener detalles de un usuario por ID
router.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = ?';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, [userId]);
        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.json(results[0]);
    } catch (error) {
        return res.status(500).send('Error al obtener detalles del usuario: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta para obtener historial de conversaciones de un usuario
router.get('/conversations/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM conversations WHERE user_id = ?';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, [userId]);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener historial de conversaciones: ' + error.message);
    } finally {
        if (connection) connection.end();
    }
});

// Ruta para obtener mensajes de una conversación específica
router.get('/messages/conversation/:conversationId', async (req, res) => {
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


router.get('/new-users', async (req, res) => {
    const query = 'SELECT * FROM users WHERE status = "new"';
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener usuarios nuevos: ' + error.message);
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

module.exports = router;
