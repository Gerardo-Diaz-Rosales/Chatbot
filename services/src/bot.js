const venom = require('venom-bot');
const createConnection = require('./db');
require('dotenv').config();

let client;

// Función para obtener o crear una conversación
const getOrCreateConversation = async (clientId) => {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT id FROM conversations WHERE client_id = ? AND finished_at IS NULL', [clientId]);
    if (rows.length > 0) {
        connection.end();
        return rows[0].id;
    } else {
        const [result] = await connection.execute('INSERT INTO conversations (client_id) VALUES (?)', [clientId]);
        connection.end();
        return result.insertId;
    }
};

// Función para finalizar una conversación
const finishConversation = async (conversationId) => {
    const connection = await createConnection();
    await connection.execute('UPDATE conversations SET finished_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);
    connection.end();
};

// Función para obtener el clientId a partir del número de teléfono
const getClientIdByPhoneNumber = async (phoneNumber) => {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT id, conversation_state FROM clients WHERE phone_number = ?', [phoneNumber]);
    if (rows.length > 0) {
        connection.end();
        return { id: rows[0].id, state: rows[0].conversation_state };
    } else {
        const [result] = await connection.execute('INSERT INTO clients (phone_number, is_cliente) VALUES (?, 0)', [phoneNumber]);
        connection.end();
        return { id: result.insertId, state: 'waiting_for_department' };
    }
};

// Función para guardar mensajes en la base de datos
const saveMessage = async (conversationId, clientId, message, sender) => {
    const connection = await createConnection();
    await connection.execute('INSERT INTO messages (conversation_id, client_id, message, sender) VALUES (?, ?, ?, ?)', [conversationId, clientId, message, sender]);
    connection.end();
};

// Función para obtener el departamento según la opción
const getDepartmentByOption = (option) => {
    const departments = {
        '1': 'Ventas',
        '2': 'Soporte',
        '3': 'Contabilidad',
        '4': 'Central Monitoreo',
        'ventas': 'Ventas',
        'soporte': 'Soporte',
        'contabilidad': 'Contabilidad',
        'central monitoreo': 'Central Monitoreo'
    };
    return departments[option];
};

// Función para asignar cliente a un departamento
const assignClientToDepartment = async (clientId, department) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute('SELECT id FROM departments WHERE name = ?', [department]);
        if (rows.length > 0) {
            const departmentId = rows[0].id;

            // Verificar si la asignación ya existe
            const [existingAssignments] = await connection.execute('SELECT * FROM client_department WHERE client_id = ? AND department_id = ?', [clientId, departmentId]);
            if (existingAssignments.length === 0) {
                await connection.execute('INSERT INTO client_department (client_id, department_id) VALUES (?, ?)', [clientId, departmentId]);
            }
        }
    } catch (error) {
        console.error('Error al asignar el cliente al departamento:', error);
    } finally {
        connection.end();
    }
};

// Función para guardar nombre y correo en la base de datos
const saveClientDetails = async (clientId, name, email) => {
    const connection = await createConnection();
    if (name) {
        await connection.execute('UPDATE clients SET name = ? WHERE id = ?', [name, clientId]);
    }
    if (email) {
        await connection.execute('UPDATE clients SET email = ? WHERE id = ?', [email, clientId]);
    }
    connection.end();
};

// Función para actualizar el estado del cliente
const updateClientState = async (clientId, state) => {
    const connection = await createConnection();
    await connection.execute('UPDATE clients SET conversation_state = ? WHERE id = ?', [state, clientId]);
    connection.end();
};

// Crear el cliente Venom
const createBot = async () => {
    client = await venom.create({ session: 'mySession', headless: false, multidevice: true });
    console.log('Venom bot conectado!');

    // En el evento onMessage
    client.onMessage(async (message) => {
        const lowerCaseMessage = message.body.toLowerCase();
        const { id: clientId, state: clientState } = await getClientIdByPhoneNumber(message.from);
        const conversationId = await getOrCreateConversation(clientId);

        if (lowerCaseMessage.includes('hola') || lowerCaseMessage.includes('buenas')) {
            const greeting = '¡Hola! Soy el bot de Grupo SAOM. Estoy listo para asistirte en todo lo que necesites. ¿A qué departamento deseas ser transferido?\n1. Ventas\n2. Soporte\n3. Contabilidad\n4. Central Monitoreo';
            await saveMessage(conversationId, clientId, message.body, 'cliente');
            await saveMessage(conversationId, clientId, greeting, 'bot');
            await client.sendText(message.from, greeting);
            await updateClientState(clientId, 'waiting_for_department');
        } else if (clientState === 'waiting_for_department' && ['1', '2', '3', '4', 'ventas', 'soporte', 'contabilidad', 'central monitoreo'].includes(lowerCaseMessage)) {
            const department = getDepartmentByOption(lowerCaseMessage);
            await assignClientToDepartment(clientId, department);
            
            // Enviar mensaje solicitando nombre completo
            const requestName = 'Proporciona tu nombre completo, por favor';
            await saveMessage(conversationId, clientId, message.body, 'cliente');
            await saveMessage(conversationId, clientId, requestName, 'bot');
            await client.sendText(message.from, requestName);
            await updateClientState(clientId, 'waiting_for_name');
        } else if (clientState === 'waiting_for_name' && !lowerCaseMessage.includes('@')) {
            // Se asume que el usuario está proporcionando su nombre
            await saveMessage(conversationId, clientId, message.body, 'cliente');
            await saveClientDetails(clientId, message.body, null); // Guardar solo el nombre en este paso
            const requestEmail = 'Gracias, por favor proporciona tu correo electrónico';
            await saveMessage(conversationId, clientId, requestEmail, 'bot');
            await client.sendText(message.from, requestEmail);
            await updateClientState(clientId, 'waiting_for_email');
        } else if (clientState === 'waiting_for_email' && lowerCaseMessage.includes('@')) {
            // Se asume que el usuario está proporcionando su correo electrónico
            await saveMessage(conversationId, clientId, message.body, 'cliente');
            await saveClientDetails(clientId, null, message.body); // Guardar solo el correo en este paso
            const confirmationMessage = 'Ya has sido asignado al departamento. En breve serás contactado por uno de nuestros operadores.';
            await saveMessage(conversationId, clientId, confirmationMessage, 'bot');
            await client.sendText(message.from, confirmationMessage);
            await updateClientState(clientId, 'completed');
            await finishConversation(conversationId);
        } else {
            await saveMessage(conversationId, clientId, message.body, 'cliente');
        }
    });
};

createBot();
