const venom = require('venom-bot');
const createConnection = require('./db');
require('dotenv').config();

let client;

// Función para obtener el userId a partir del número de teléfono
const getUserIdByPhoneNumber = async (phoneNumber) => {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT id FROM users WHERE phone_number = ?', [phoneNumber]);
    if (rows.length > 0) {
        connection.end();
        return rows[0].id;
    } else {
        const [result] = await connection.execute('INSERT INTO users (phone_number, status) VALUES (?, ?)', [phoneNumber, 'new']);
        connection.end();
        return result.insertId;
    }
};

// Función para guardar mensajes en la base de datos
const saveMessage = async (userId, message, sender) => {
    const connection = await createConnection();
    await connection.execute('INSERT INTO messages (user_id, message, sender) VALUES (?, ?, ?)', [userId, message, sender]);
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

// Función para asignar usuario a un departamento
const assignUserToDepartment = async (userId, department) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute('SELECT id FROM departments WHERE name = ?', [department]);
        if (rows.length > 0) {
            const departmentId = rows[0].id;

            // Verificar si la asignación ya existe
            const [existingAssignments] = await connection.execute('SELECT * FROM user_department WHERE user_id = ? AND department_id = ?', [userId, departmentId]);
            if (existingAssignments.length === 0) {
                await connection.execute('INSERT INTO user_department (user_id, department_id) VALUES (?, ?)', [userId, departmentId]);
            }
        }
    } catch (error) {
        console.error('Error al asignar el usuario al departamento:', error);
    } finally {
        connection.end();
    }
};

// Función para guardar nombre y correo en la base de datos
const saveUserDetails = async (userId, name, email) => {
    const connection = await createConnection();
    await connection.execute('INSERT INTO user_details (user_id, name, email) VALUES (?, ?, ?)', [userId, name, email]);
    connection.end();
};

// Crear el cliente Venom
const createBot = async () => {
    client = await venom.create({ session: 'mySession', headless: false, multidevice: true });
    console.log('Venom bot conectado!');

    // En el evento onMessage
    client.onMessage(async (message) => {
        const lowerCaseMessage = message.body.toLowerCase();
        const userId = await getUserIdByPhoneNumber(message.from);
    
        if (lowerCaseMessage.includes('hola') || lowerCaseMessage.includes('buenas')) {
            const greeting = '¡Hola! Soy el bot de la empresa Grupo SAOM. ¿Te gustaría ser atendido por el bot o por un operador?\n1. Bot\n2. Operador';
            await saveMessage(userId, message.body, 'cliente');
            await saveMessage(userId, greeting, 'bot');
            await client.sendText(message.from, greeting);
        } else if (lowerCaseMessage === '1' || lowerCaseMessage.includes('bot')) {
            const botResponse = 'Entiendo, haré todo lo posible para atender tus consultas. ¿En qué te puedo ayudar?';
            await saveMessage(userId, message.body, 'cliente');
            await saveMessage(userId, botResponse, 'bot');
            await client.sendText(message.from, botResponse);
        } else if (lowerCaseMessage === '2' || lowerCaseMessage.includes('operador')) {
            const transferMessage = 'Entiendo, te transfiero con uno de nuestros operadores. ¿A cuál área deseas ser transferido?\n1. Ventas\n2. Soporte\n3. Contabilidad\n4. Central Monitoreo';
            await saveMessage(userId, message.body, 'cliente');
            await saveMessage(userId, transferMessage, 'bot');
            await client.sendText(message.from, transferMessage);
        } else {
            const department = getDepartmentByOption(lowerCaseMessage);
            if (department) {
                await assignUserToDepartment(userId, department);
                
                // Enviar mensaje solicitando nombre completo
                const requestName = 'Proporciona tu nombre completo por favor';
                await saveMessage(userId, message.body, 'cliente');
                await saveMessage(userId, requestName, 'bot');
                await client.sendText(message.from, requestName);
                
                // Configurar estado para solicitar nombre y correo
                client.onMessage(async (message) => {
                    if (message.from === userId) {
                        const userInput = message.body;
                        if (userInput && !userInput.includes('@')) {
                            // Se asume que el usuario está proporcionando su nombre
                            await saveMessage(userId, userInput, 'cliente');
                            await saveMessage(userId, 'Gracias, por favor proporciona tu correo electrónico', 'bot');
                            await client.sendText(message.from, 'Gracias, por favor proporciona tu correo electrónico');
                        } else if (userInput.includes('@')) {
                            // Se asume que el usuario está proporcionando su correo electrónico
                            await saveMessage(userId, userInput, 'cliente');
                            await saveUserDetails(userId, userInput, userInput); // Aquí guardamos nombre y correo
                            const confirmationMessagePart1 = 'Ya has sido asignado al departamento de Contabilidad, en breve serás contactado por uno de nuestros operadores.';
                            const confirmationMessagePart2 = 'Buenas tardes. Por favor, proporciona tu nombre y correo electrónico.';
                            await saveMessage(userId, confirmationMessagePart1, 'bot');
                            await saveMessage(userId, confirmationMessagePart2, 'bot');
                            await client.sendText(message.from, confirmationMessagePart1);
                            await client.sendText(message.from, confirmationMessagePart2);
                        }
                    }
                });
                
            } else {
                await saveMessage(userId, message.body, 'cliente');
            }
        }
    });
};

createBot();