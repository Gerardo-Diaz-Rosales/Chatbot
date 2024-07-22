// src/bot.js
const venom = require('venom-bot');
const db = require('./db'); // Importa la conexión a la base de datos
const Transfer = require('./modules/Transfer');
const axios = require('axios');
require('dotenv').config(); // Para manejar variables de entorno

let client;

// Crear el cliente Venom
const createBot = async () => {
    client = await venom.create({ session: 'mySession', headless: false, multidevice: true });
    console.log('Venom bot conectado!');

    // En el evento onMessage
    client.onMessage(async (message) => {
        const lowerCaseMessage = message.body.toLowerCase();
    
        if (lowerCaseMessage.includes('transferir')) {
            const response = Transfer.transferConversation();
            await client.sendText(message.from, response);
        } else {
            //const aiResponse = await getAIResponse(message.body);
            await saveMessage(message.from, message.body, 'cliente');
            await saveMessage(message.from, aiResponse, 'bot');
            await client.sendText(message.from, aiResponse);
        }
    });
};

const saveMessage = async (userId, content, senderType) => {
    const query = `
        INSERT INTO Messages (conversation_id, sender_type, user_id, content, content_type)
        VALUES (?, ?, ?, ?, 'texto')
    `;

    // Lógica para determinar un conversation_id único debería ir aquí
    const conversationId = 1; // Ajustar según sea necesario

    try {
        const results = await db.promise().query(query, [conversationId, senderType, userId, content]);
        console.log('Mensaje guardado con éxito:', results[0].insertId);
    } catch (error) {
        console.error('Error al guardar el mensaje:', error);
    }
};

const getAIResponse = async (userInput) => {
    const apiKey = process.env.OPENAI_API_KEY; // Usa la variable de entorno
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userInput }]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error al obtener respuesta de OpenAI:', error);
        return 'Lo siento, no pude procesar tu solicitud.';
    }
};

createBot().catch(error => {
    console.error('Error al conectar Venom:', error);
});

const getClient = () => {
    return client;
};

module.exports = { getClient };
