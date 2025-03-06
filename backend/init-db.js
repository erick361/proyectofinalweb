const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '19dic2005',
    });

    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'base_de_datos'}`);
    
    // Usar la base de datos
    await connection.query(`USE ${process.env.DB_NAME || 'base_de_datos'}`);
    
    // Crear tabla de usuarios
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `);
    
    // Crear tabla de vehículos
    await connection.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            year INT NOT NULL,
            type VARCHAR(255) NOT NULL,
            image VARCHAR(255),
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    
    console.log('Base de datos inicializada correctamente');
    connection.end();
}

setupDatabase().catch(console.error);