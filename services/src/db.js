const mysql = require('mysql2/promise');
require('dotenv').config();

const createConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Conexión a la base de datos exitosa!');
        return connection;
    } catch (err) {
        console.error('Error conectando a la base de datos:', err);
        throw err;
    }
};

module.exports = createConnection;