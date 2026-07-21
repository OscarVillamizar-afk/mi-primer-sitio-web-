console.log('🚀 Iniciando script server.js...');

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── 1. CREAR CARPETA UPLOADS SI NO EXISTE ────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── 2. MIDDLEWARES ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// ── 3. CONEXIÓN A MYSQL ───────────────────────────────────────────
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234', // <--- Poner comillas '1234'
    database: process.env.DB_NAME || 'db_final_ttdt',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Comprobar la conexión asíncronamente
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conexión a MySQL (db_final_ttdt) establecida con éxito.');
        connection.release();
    } catch (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    }
})();

// ── 4. CONFIGURACIÓN DE MULTER ────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ── 5. RUTAS API ──────────────────────────────────────────────────

// TAREAS
app.get('/api/tareas/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const [tareas] = await db.query(`
            SELECT 
                t.id_tarea AS id, t.descripcion, t.estado, t.prioridad,
                DATE_FORMAT(t.fecha_asignacion, '%d/%m/%Y') AS fechaAsig,
                DATE_FORMAT(t.fecha_limite, '%d/%m/%Y') AS fechaLim,
                t.id_tecnico, CONCAT(u.nombre, ' ', u.apellido) AS tecnico
            FROM tarea t
            JOIN dueno d ON t.id_dueno = d.id_dueno
            JOIN tecnico_moderador tm ON t.id_tecnico = tm.id_tecnico
            JOIN usuario u ON tm.id_usuario = u.id_usuario
            WHERE d.id_usuario = ?
            ORDER BY t.id_tarea DESC
        `, [usuarioId]);
        res.json(tareas);
    } catch (error) {
        console.error("Error obteniendo tareas:", error);
        res.status(500).json({ error: "Error al obtener las tareas" });
    }
});

app.get('/api/tecnicos', async (req, res) => {
    try {
        const [tecnicos] = await db.query(`
            SELECT tm.id_tecnico, CONCAT(u.nombre, ' ', u.apellido) AS nombre
            FROM tecnico_moderador tm
            JOIN usuario u ON tm.id_usuario = u.id_usuario
            ORDER BY u.nombre
        `);
        res.json(tecnicos);
    } catch (error) {
        console.error("Error obteniendo técnicos:", error);
        res.status(500).json({ error: "Error al obtener los técnicos" });
    }
});

// LOGIN
const MAPA_TIPO_FRONT_A_BD = {
    'dueno': 'Dueno',
    'vendedor': 'Colaborador',
    'usuario': 'Comprador'
};

app.post('/api/login', async (req, res) => {
    try {
        const { tipoUsuario, email, password } = req.body;
        const tipoBD = MAPA_TIPO_FRONT_A_BD[tipoUsuario];
        if (!tipoBD) return res.status(400).json({ error: "Tipo de usuario inválido" });

        const [rows] = await db.query('SELECT * FROM usuario WHERE correo = ? AND tipo_usuario = ?', [email, tipoBD]);
        if (rows.length === 0) return res.status(401).json({ error: "Credenciales incorrectas" });

        const usuario = rows[0];
        if (usuario.estado !== 'activo') {
            return res.status(403).json({ error: "Este usuario está inactivo." });
        }

        const passwordValida = await bcrypt.compare(password, usuario.contrasena);
        if (!passwordValida) return res.status(401).json({ error: "Credenciales incorrectas" });

        res.json({ id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, tipo: tipoUsuario });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

// PRODUCTOS
app.get('/api/productos', async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT p.id_producto AS id, p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, c.nombre AS categoria
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto DESC
        `);
        res.json(productos);
    } catch (error) {
        console.error("Error productos:", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

// ── 6. INICIALIZACIÓN DEL SERVIDOR ────────────────────────────────
app.listen(PORT, () => {
    console.log(`🌐 Servidor escuchando en el puerto ${PORT}`);
});