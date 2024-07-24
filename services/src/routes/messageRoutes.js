const express = require('express');
const router = express.Router();
const createConnection = require('../db');
const { getClient, isBotReady } = require('../bot');

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

// Ruta para enviar un mensaje a un cliente por ID
router.post('/client/:id/send', async (req, res) => {
    const clientId = req.params.id;
    const { message } = req.body;
    let connection;

    try {
        if (!isBotReady()) {
            return res.status(503).send('El bot aún no está listo. Por favor, inténtalo de nuevo en unos momentos.');
        }

        const client = getClient();
        if (!client) {
            return res.status(500).send('Bot no disponible. Por favor, contacta al administrador.');
        }

        connection = await createConnection();
        
        // Verificar si el cliente existe
        const [clientResults] = await connection.execute('SELECT * FROM clients WHERE id = ?', [clientId]);
        
        if (clientResults.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        const phoneNumber = clientResults[0].phone_number;

        // Obtener o crear una conversación
        const [conversationResults] = await connection.execute('SELECT id FROM conversations WHERE client_id = ? AND finished_at IS NULL', [clientId]);
        let conversationId;
        
        if (conversationResults.length > 0) {
            conversationId = conversationResults[0].id;
        } else {
            const [newConversation] = await connection.execute('INSERT INTO conversations (client_id) VALUES (?)', [clientId]);
            conversationId = newConversation.insertId;
        }

        // Enviar el mensaje al cliente
        await client.sendText(phoneNumber, message);

        // Guardar el mensaje en la base de datos
        await connection.execute('INSERT INTO messages (conversation_id, client_id, message, sender) VALUES (?, ?, ?, ?)', 
            [conversationId, clientId, message, 'operador']);

        res.send('Mensaje enviado y guardado correctamente');
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return res.status(500).send('Error al enviar mensaje: ' + error.message);
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