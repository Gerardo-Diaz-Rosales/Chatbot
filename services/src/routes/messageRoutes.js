// src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { getClient } = require('../bot');
const createConnection = require('../db'); // Ajusta según tu archivo de conexión

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

// Ruta para obtener posibles clientes
router.get('/potential-clients', async (req, res) => {
    const query = 'SELECT * FROM Potential_Clients JOIN Users ON Potential_Clients.user_id = Users.user_id';
    const connection = await createConnection(); // Usar conexión prometida
    try {
        const [results] = await connection.execute(query);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener posibles clientes: ' + error.message);
    } finally {
        connection.end();
    }
});

// Ruta para obtener detalles de un cliente potencial por ID
router.get('/potential-clients/:id', async (req, res) => {
    const clientId = req.params.id;
    const query = 'SELECT * FROM Potential_Clients JOIN Users ON Potential_Clients.user_id = Users.user_id WHERE Potential_Clients.potential_client_id = ?';
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(query, [clientId]);
        if (results.length === 0) {
            return res.status(404).send('Cliente potencial no encontrado');
        }
        res.json(results[0]);
    } catch (error) {
        return res.status(500).send('Error al obtener detalles del cliente potencial: ' + error.message);
    } finally {
        connection.end();
    }
});

// Ruta para obtener historial de conversaciones de un cliente potencial
router.get('/conversations', async (req, res) => {
    const clientId = req.query.client_id;
    const query = 'SELECT Conversations.*, Users.name AS operator_name FROM Conversations LEFT JOIN Operators ON Conversations.operator_id = Operators.operator_id LEFT JOIN Users ON Operators.user_id = Users.user_id WHERE Conversations.potential_client_id = ?';
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(query, [clientId]);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener historial de conversaciones: ' + error.message);
    } finally {
        connection.end();
    }
});

// Ruta para obtener mensajes de una conversación específica
router.get('/messages', async (req, res) => {
    const conversationId = req.query.conversation_id;
    const query = 'SELECT Messages.*, Users.name AS sender_name FROM Messages LEFT JOIN Users ON Messages.user_id = Users.user_id WHERE Messages.conversation_id = ?';
    const connection = await createConnection();
    try {
        const [results] = await connection.execute(query, [conversationId]);
        res.json(results);
    } catch (error) {
        return res.status(500).send('Error al obtener mensajes de la conversación: ' + error.message);
    } finally {
        connection.end();
    }
});

// Ruta para enviar mensajes a través de la API
router.post('/messages/send', async (req, res) => {
    const { conversation_id, sender_type, user_id, content, content_type } = req.body;
    if (!conversation_id || !sender_type || !user_id || !content || !content_type) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    const connection = await createConnection();
    try {
        const result = await connection.execute(
            'INSERT INTO Messages (conversation_id, sender_type, user_id, content, content_type) VALUES (?, ?, ?, ?, ?)',
            [conversation_id, sender_type, user_id, content, content_type]
        );
        res.status(200).json({ message: 'Mensaje enviado exitosamente', data: result });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    } finally {
        connection.end();
    }
});

module.exports = router;
