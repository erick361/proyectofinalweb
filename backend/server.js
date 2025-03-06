require('dotenv').config(); 

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { validateVehicle } = require('./middleware/validateData');

const app = express();

// Configuración dinámica de CORS basada en el entorno
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app-de-autos.onrender.com', 'https://tu-app-frontend.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '19dic2005',
    database: process.env.DB_NAME || 'base_de_datos',
    port: 3306,
    connectTimeout: 10000 
});

function handleDisconnect(connection) {
    connection.on('error', function(err) {
        console.log('Error de BD:', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Conexión perdida. Reconectando...');
            handleDisconnect(mysql.createConnection(connection.config));
        } else {
            throw err;
        }
    });
}

handleDisconnect(db);

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});


app.get('/', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            console.error('Error en prueba DB:', err);
            return res.status(500).json({ message: 'Error en la base de datos', error: err.message });
        }
        return res.json({ message: 'Conexión a la base de datos exitosa', data: results });
    });
});


app.get('/vehicles', (req, res) => {
    const { user_id } = req.query;
    const sql = 'SELECT * FROM vehicles WHERE user_id = ?';
    db.query(sql, [user_id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});


app.get('/all-vehicles', (req, res) => {
    const sql = 'SELECT * FROM vehicles';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/vehicles/others', (req, res) => {
    const { user_id } = req.query;
    const sql = 'SELECT * FROM vehicles WHERE user_id != ?';
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error al obtener vehículos' });
        }
        res.json(result);
    });
});

app.post('/vehicles', validateVehicle, (req, res) => {
    const { name, year, type, user_id } = req.body;
    let image = '';
    if (type === 'SUV') {
        image = '/public/suv.png';
    } else if (type === 'Sedan') {
        image = '/public/sedan.png';
    }
    const sql = 'INSERT INTO vehicles (name, year, type, image, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, year, type, image, user_id], (err, result) => {
        if (err) throw err;
        res.status(201).json({ id: result.insertId });
    });
});

app.put('/vehicles/:id', validateVehicle, (req, res) => {
    const { id } = req.params;
    const { name, year, type, user_id } = req.body;
    let image = '';
    if (type === 'SUV') {
        image = '/public/suv.png';
    } else if (type === 'Sedan') {
        image = '/public/sedan.png';
    }
    const sql = 'UPDATE vehicles SET name = ?, year = ?, type = ?, image = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [name, year, type, image, id, user_id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Vehicle updated' });
    });
});

app.delete('/vehicles/:id', (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    const sql = 'DELETE FROM vehicles WHERE id = ? AND user_id = ?';
    db.query(sql, [id, user_id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Vehicle deleted' });
    });
});

app.post('/vehicles/buy/:id', (req, res) => {
    const { id } = req.params; // Asegúrate de que id se extrae correctamente de los parámetros
    const { buyer_id } = req.body;
    
    // Primero, verificamos que el vehículo exista y no pertenezca ya al comprador
    const checkSql = 'SELECT * FROM vehicles WHERE id = ?';
    db.query(checkSql, [id], (err, result) => {
        if (err) {
            console.error('Error al verificar vehículo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }
        
        const vehicle = result[0];
        
        if (vehicle.user_id.toString() === buyer_id.toString()) {
            return res.status(400).json({ message: 'No puedes comprar tu propio vehículo' });
        }
        
        // Actualizamos el propietario del vehículo
        const updateSql = 'UPDATE vehicles SET user_id = ? WHERE id = ?';
        db.query(updateSql, [buyer_id, id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error al actualizar vehículo:', updateErr);
                return res.status(500).json({ message: 'Error al comprar el vehículo' });
            }
            
            res.json({ 
                message: 'Vehículo comprado con éxito',
                vehicleId: id 
            });
        });
    });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ message: 'Error al registrar el usuario' });
            }
            res.status(201).json({ message: 'Usuario registrado' });
        });
    } catch (error) {
        console.error('Error al hashear la contraseña:', error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });
        if (results.length === 0) return res.status(401).json({ message: 'Autenticacion fallida' });

        try {
            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: 'Autenticacion fallida' });

            res.json({ user_id: user.id, message: 'Autenticacion exitosa' });
        } catch (error) {
            console.error('Error al verificar contraseña:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    });
});


app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err.stack);
    res.status(500).json({ message: 'Algo salio mal!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
