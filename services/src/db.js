// src/db.js
const mysql = require('mysql2/promise');

const createConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'whatsapp_db'
        });
        console.log('Conexión a la base de datos exitosa!');
        return connection;
    } catch (err) {
        console.error('Error conectando a la base de datos:', err);
    }
};

module.exports = createConnection;
