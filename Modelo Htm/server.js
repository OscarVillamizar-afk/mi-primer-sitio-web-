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
app.use(express.static(path.join(__dirname)));

// ── 3. CONEXIÓN A MYSQL ───────────────────────────────────────────
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3000,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Oscar2007seguro',
    database: process.env.DB_NAME || 'db_final_ttdt',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false, // <--- SSL activado solo en la nube
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err.message);
    });

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

const uploadFotoPerfil = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, tiposPermitidos.includes(file.mimetype));
    }
});

// ── 5. RUTAS API ──────────────────────────────────────────────────

// ── TAREAS ────────────────────────────────────────────────────────
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

app.post('/api/tareas', async (req, res) => {
    try {
        const { usuario_id, descripcion, id_tecnico, prioridad, estado, fecha_limite } = req.body;
        const [duenoRows] = await db.query('SELECT id_dueno FROM dueno WHERE id_usuario = ?', [usuario_id]);
        if (duenoRows.length === 0) return res.status(404).json({ error: "Dueño no encontrado" });
        
        const id_dueno = duenoRows[0].id_dueno;
        const [resultado] = await db.query(
            `INSERT INTO tarea (descripcion, estado, prioridad, fecha_limite, id_dueno, id_tecnico) VALUES (?, ?, ?, ?, ?, ?)`,
            [descripcion, estado, prioridad, fecha_limite, id_dueno, id_tecnico]
        );
        res.status(201).json({ mensaje: "Tarea creada con éxito", id: resultado.insertId });
    } catch (error) {
        console.error("Error creando tarea:", error);
        res.status(500).json({ error: "Error al crear la tarea" });
    }
});

app.put('/api/tareas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, id_tecnico, prioridad, estado, fecha_limite } = req.body;
        await db.query(
            `UPDATE tarea SET descripcion = ?, estado = ?, prioridad = ?, fecha_limite = ?, id_tecnico = ? WHERE id_tarea = ?`,
            [descripcion, estado, prioridad, fecha_limite, id_tecnico, id]
        );
        res.json({ mensaje: "Tarea actualizada con éxito" });
    } catch (error) {
        console.error("Error actualizando tarea:", error);
        res.status(500).json({ error: "Error al actualizar la tarea" });
    }
});

app.delete('/api/tareas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tarea WHERE id_tarea = ?', [id]);
        res.json({ mensaje: "Tarea eliminada con éxito" });
    } catch (error) {
        console.error("Error eliminando tarea:", error);
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
});

// ── DASHBOARD ADMIN ───────────────────────────────────────────────
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [ventas] = await db.query('SELECT SUM(total) as ventas_mes FROM pedidos WHERE MONTH(fecha) = MONTH(CURRENT_DATE())');
        const [usuarios] = await db.query('SELECT COUNT(*) as usuarios_total FROM usuario');
        const [productos] = await db.query('SELECT COUNT(*) as productos_total FROM producto');
        const [pedidos] = await db.query('SELECT COUNT(*) as pedidos_pendientes FROM pedidos WHERE estado = "Pendiente"');
        
        const [ventasRecientes] = await db.query('SELECT id, cliente, producto, total, estado, DATE_FORMAT(fecha, "%d/%m/%Y") as fecha FROM pedidos ORDER BY fecha DESC LIMIT 5');
        const [tareas] = await db.query('SELECT texto, asignado, prioridad FROM tareas_admin');
        const [tiposUsuario] = await db.query('SELECT tipo_usuario as nombre, COUNT(*) as cantidad FROM usuario GROUP BY tipo_usuario');
        const [incidencias] = await db.query('SELECT titulo, modulo, fecha FROM incidencias ORDER BY id DESC LIMIT 5');
        const [actividad] = await db.query('SELECT icono, texto, tiempo FROM actividad_reciente ORDER BY id DESC LIMIT 6');

        res.json({
            ventas_mes: ventas[0]?.ventas_mes || 0,
            usuarios_total: usuarios[0]?.usuarios_total || 0,
            productos_total: productos[0]?.productos_total || 0,
            pedidos_pendientes: pedidos[0]?.pedidos_pendientes || 0,
            ventas_recientes: ventasRecientes,
            tareas,
            tipos_usuario: tiposUsuario,
            incidencias,
            actividad
        });
    } catch (error) {
        console.error("Error Dashboard:", error);
        res.status(500).json({ error: "Error al obtener métricas" });
    }
});

// ── AUTENTICACIÓN Y REGISTRO ─────────────────────────────────────
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

        res.json({
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido || '',
            correo: usuario.correo,
            tipo: tipoUsuario,
            fotoPerfil: usuario.foto_perfil || null
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

app.post('/api/registro/usuario', async (req, res) => {
    try {
        const { nombre, apellido, email, password, direccion, codigoPostal, fechaNac } = req.body;
        const [existe] = await db.query('SELECT id_usuario FROM usuario WHERE correo = ?', [email]);
        if (existe.length > 0) return res.status(409).json({ error: "Ese correo ya está registrado" });

        const hashContrasena = await bcrypt.hash(password, 10);
        const [resultado] = await db.query(
            `INSERT INTO usuario (nombre, apellido, correo, contrasena, direccion, codigo_postal, fecha_nacimiento, tipo_usuario, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Comprador', 'activo')`,
            [nombre, apellido || '', email, hashContrasena, direccion, codigoPostal, fechaNac]
        );

        res.status(201).json({ id: resultado.insertId, nombre, correo: email, tipo: 'usuario' });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Error al crear la cuenta" });
    }
});

app.post('/api/registro/vendedor', async (req, res) => {
    let conexion;
    try {
        conexion = await db.getConnection();
        const { nombre, apellido, email, password, direccion, codigoPostal, fechaNac, negocio, telefono, categoria, descripcion } = req.body;
        
        const [existe] = await conexion.query('SELECT id_usuario FROM usuario WHERE correo = ?', [email]);
        if (existe.length > 0) return res.status(409).json({ error: "Ese correo ya está registrado" });

        const hashContrasena = await bcrypt.hash(password, 10);
        await conexion.beginTransaction();

        const [resultadoUsuario] = await conexion.query(
            `INSERT INTO usuario (nombre, apellido, correo, contrasena, direccion, codigo_postal, fecha_nacimiento, tipo_usuario, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Colaborador', 'activo')`,
            [nombre, apellido || '', email, hashContrasena, direccion, codigoPostal, fechaNac]
        );

        const idUsuario = resultadoUsuario.insertId;
        await conexion.query(
            `INSERT INTO usuario_colaborador (id_usuario, nombre_negocio, tipo_negocio, telefono, categoria_principal, descripcion, comisiones_ventas)
             VALUES (?, ?, ?, ?, ?, ?, 0.00)`,
            [idUsuario, negocio, categoria, telefono, categoria, descripcion]
        );

        await conexion.commit();
        res.status(201).json({ id: idUsuario, nombre, correo: email, tipo: 'vendedor' });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error("Error en registro vendedor:", error);
        res.status(500).json({ error: "Error al crear la cuenta de vendedor" });
    } finally {
        if (conexion) conexion.release();
    }
});

// ── PRODUCTOS (LEFT JOIN corregido para no retornar vacíos por categoría) ─────
app.get('/api/productos', async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT 
                p.id_producto AS id, 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.stock, 
                p.id_categoria, 
                COALESCE(c.nombre, 'Sin Categoría') AS categoria, 
                COALESCE(SUM(dv.cantidad), 0) AS ventas
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN detalle_venta dv ON dv.id_producto = p.id_producto
            GROUP BY p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, c.nombre
            ORDER BY p.id_producto DESC
        `);
        res.json(productos);
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, id_categoria, precio, stock, descripcion } = req.body;
        const [resultado] = await db.query(
            `INSERT INTO producto (nombre, id_categoria, precio, stock, descripcion) VALUES (?, ?, ?, ?, ?)`,
            [nombre, id_categoria, precio, stock, descripcion]
        );
        res.status(201).json({ mensaje: "Producto creado con éxito", id: resultado.insertId });
    } catch (error) {
        console.error("Error creando producto:", error);
        res.status(500).json({ error: "Error al crear el producto" });
    }
});

app.get('/api/foro/publicaciones', async (req, res) => {
    try {
        const { categoria, q } = req.query;
        let condiciones = ['f.estado_reportado = 0'];
        let valores = [];

        if (categoria) {
            condiciones.push('c.nombre = ?');
            valores.push(categoria);
        }
        if (q) {
            condiciones.push('(f.Titulo LIKE ? OR f.descripcion LIKE ?)');
            valores.push(`%${q}%`, `%${q}%`);
        }

        const whereSQL = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

        const [temas] = await db.query(`
            SELECT
                f.id_foro AS id,
                f.Titulo AS titulo,
                f.descripcion AS contenido,
                COALESCE(c.nombre, 'General') AS categoria,
                f.fecha_creacion,
                0 AS vistas,
                CONCAT(u.nombre, ' ', u.apellido) AS autor_nombre,
                COUNT(pf.id_publicacion_foro) AS num_respuestas
            FROM foro f
            LEFT JOIN categoria c ON f.id_categoria = c.id_categoria
            LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
            LEFT JOIN publicacion_foro pf ON pf.id_foro = f.id_foro
            ${whereSQL}
            GROUP BY f.id_foro, f.Titulo, f.descripcion, c.nombre, f.fecha_creacion, u.nombre, u.apellido
            ORDER BY f.fecha_creacion DESC
        `, valores);

        res.json(temas);
    } catch (error) {
        console.error("Error obteniendo publicaciones del foro:", error);
        res.status(500).json({ error: "Error al obtener las publicaciones del foro" });
    }
});

app.post('/api/foro/publicaciones', upload.array('adjuntos', 3), async (req, res) => {
    try {
        const { usuario_id, titulo, categoria, contenido } = req.body;

        if (!usuario_id || !titulo || !contenido) {
            return res.status(400).json({ error: "Faltan datos obligatorios (usuario_id, titulo, contenido)" });
        }

        let id_categoria = null;
        if (categoria) {
            const [catRows] = await db.query('SELECT id_categoria FROM categoria WHERE nombre = ?', [categoria]);
            if (catRows.length > 0) id_categoria = catRows[0].id_categoria;
        }

        const [resultado] = await db.query(
            `INSERT INTO foro (Titulo, id_categoria, descripcion, id_usuario) VALUES (?, ?, ?, ?)`,
            [titulo, id_categoria, contenido, usuario_id]
        );

        res.status(201).json({ mensaje: "Pregunta publicada con éxito", id: resultado.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Ya existe una pregunta con ese título exacto. Cámbialo un poco." });
        }
        console.error("Error creando publicación de foro:", error);
        res.status(500).json({ error: "Error al crear la publicación" });
    }
});

// ── FORO: ver un hilo completo (pregunta + respuestas) ─────────────
app.get('/api/foro/publicaciones/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [temaRows] = await db.query(`
            SELECT
                f.id_foro AS id,
                f.Titulo AS titulo,
                f.descripcion AS contenido,
                COALESCE(c.nombre, 'general') AS categoria,
                f.fecha_creacion,
                0 AS vistas,
                CONCAT(u.nombre, ' ', u.apellido) AS autor_nombre
            FROM foro f
            LEFT JOIN categoria c ON f.id_categoria = c.id_categoria
            LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
            WHERE f.id_foro = ?
        `, [id]);

        if (temaRows.length === 0) {
            return res.status(404).json({ error: "Pregunta no encontrada" });
        }

        const [respuestas] = await db.query(`
            SELECT
                pf.id_publicacion_foro AS id,
                pf.contenido,
                pf.fecha_creacion,
                pf.likes,
                CONCAT(u.nombre, ' ', u.apellido) AS autor_nombre
            FROM publicacion_foro pf
            LEFT JOIN usuario u ON pf.id_usuario = u.id_usuario
            WHERE pf.id_foro = ? AND pf.estado_reportado = 0
            ORDER BY pf.fecha_creacion ASC
        `, [id]);

        res.json({ tema: temaRows[0], respuestas });
    } catch (error) {
        console.error("Error obteniendo el hilo:", error);
        res.status(500).json({ error: "Error al obtener el hilo" });
    }
});

// ── FORO: publicar una respuesta a un hilo ──────────────────────────
app.post('/api/foro/publicaciones/:id/respuestas', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, contenido } = req.body;

        if (!usuario_id || !contenido || contenido.trim().length < 10) {
            return res.status(400).json({ error: "Faltan datos o la respuesta es muy corta" });
        }

        const [resultado] = await db.query(
            `INSERT INTO publicacion_foro (id_foro, id_usuario, contenido) VALUES (?, ?, ?)`,
            [id, usuario_id, contenido.trim()]
        );

        res.status(201).json({ mensaje: "Respuesta publicada con éxito", id: resultado.insertId });
    } catch (error) {
        console.error("Error creando respuesta:", error);
        res.status(500).json({ error: "Error al crear la respuesta" });
    }
});

// ── FORO: reportar un hilo ──────────────────────────────────────────
app.post('/api/foro/publicaciones/:id/reportar', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE foro SET estado_reportado = 1 WHERE id_foro = ?', [id]);
        res.json({ mensaje: "Hilo reportado. Gracias por avisarnos." });
    } catch (error) {
        console.error("Error reportando hilo:", error);
        res.status(500).json({ error: "Error al reportar el hilo" });
    }
});

// ── FORO: guardar un hilo ───────────────────────────────────────────
app.post('/api/foro/publicaciones/:id/guardar', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

        await db.query(
            'INSERT IGNORE INTO foro_guardado (id_usuario, id_foro) VALUES (?, ?)',
            [usuario_id, id]
        );
        res.json({ mensaje: "Hilo guardado", guardado: true });
    } catch (error) {
        console.error("Error guardando hilo:", error);
        res.status(500).json({ error: "Error al guardar el hilo" });
    }
});

// ── FORO: quitar un hilo de guardados ────────────────────────────────
app.delete('/api/foro/publicaciones/:id/guardar', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ error: "Falta usuario_id" });

        await db.query(
            'DELETE FROM foro_guardado WHERE id_usuario = ? AND id_foro = ?',
            [usuario_id, id]
        );
        res.json({ mensaje: "Hilo quitado de guardados", guardado: false });
    } catch (error) {
        console.error("Error quitando hilo guardado:", error);
        res.status(500).json({ error: "Error al quitar el hilo guardado" });
    }
});

// ── FORO: saber si el usuario ya guardó este hilo ────────────────────
app.get('/api/foro/publicaciones/:id/guardado', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.query;
        if (!usuario_id) return res.json({ guardado: false });

        const [rows] = await db.query(
            'SELECT 1 FROM foro_guardado WHERE id_usuario = ? AND id_foro = ?',
            [usuario_id, id]
        );
        res.json({ guardado: rows.length > 0 });
    } catch (error) {
        console.error("Error consultando guardado:", error);
        res.status(500).json({ error: "Error al consultar guardado" });
    }
});

// ── PRODUCTOS: obtener uno solo por id ──────────────────────────────
app.get('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [productos] = await db.query(`
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.id_categoria,
                COALESCE(c.nombre, 'Sin Categoría') AS categoria
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ?
        `, [id]);

        if (productos.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(productos[0]);
    } catch (error) {
        console.error("Error obteniendo el producto:", error);
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// ── CARRITO: agregar un producto (crea el carrito si no existe) ─────
app.post('/api/carrito/agregar', async (req, res) => {
    let conexion;
    try {
        const { usuario_id, producto_id, cantidad } = req.body;
        if (!usuario_id || !producto_id) {
            return res.status(400).json({ error: "Faltan datos (usuario_id, producto_id)" });
        }
        const cantidadFinal = cantidad && cantidad > 0 ? cantidad : 1;

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        // 1. Buscar o crear el carrito del usuario (id_usuario es UNIQUE en carrito)
        let [carritoRows] = await conexion.query('SELECT id_carrito FROM carrito WHERE id_usuario = ?', [usuario_id]);
        let id_carrito;
        if (carritoRows.length === 0) {
            const [resultadoCarrito] = await conexion.query('INSERT INTO carrito (id_usuario) VALUES (?)', [usuario_id]);
            id_carrito = resultadoCarrito.insertId;
        } else {
            id_carrito = carritoRows[0].id_carrito;
        }

        // 2. Obtener el precio actual del producto
        const [productoRows] = await conexion.query('SELECT precio FROM producto WHERE id_producto = ?', [producto_id]);
        if (productoRows.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        const precioActual = productoRows[0].precio;

        // 3. Si el producto ya está en el carrito, sumar cantidad; si no, insertarlo
        const [detalleRows] = await conexion.query(
            'SELECT id_detalle_carrito, cantidad FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?',
            [id_carrito, producto_id]
        );

        if (detalleRows.length > 0) {
            const nuevaCantidad = detalleRows[0].cantidad + cantidadFinal;
            await conexion.query(
                'UPDATE detalle_carrito SET cantidad = ?, precio = ? WHERE id_detalle_carrito = ?',
                [nuevaCantidad, precioActual, detalleRows[0].id_detalle_carrito]
            );
        } else {
            await conexion.query(
                'INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)',
                [id_carrito, producto_id, cantidadFinal, precioActual]
            );
        }

        // 4. Recalcular el total del carrito
        const [totalRows] = await conexion.query(
            'SELECT SUM(cantidad * precio) AS total FROM detalle_carrito WHERE id_carrito = ?',
            [id_carrito]
        );
        const nuevoTotal = totalRows[0].total || 0;
        await conexion.query('UPDATE carrito SET total = ? WHERE id_carrito = ?', [nuevoTotal, id_carrito]);

        await conexion.commit();
        res.status(201).json({ mensaje: "Producto agregado al carrito", id_carrito, total: nuevoTotal });

    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error("Error agregando al carrito:", error);
        res.status(500).json({ error: "Error al agregar al carrito" });
    } finally {
        if (conexion) conexion.release();
    }
});

// ── CARRITO: obtener el carrito completo de un usuario ──────────────
app.get('/api/carrito/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [carritoRows] = await db.query('SELECT id_carrito FROM carrito WHERE id_usuario = ?', [usuario_id]);
        if (carritoRows.length === 0) {
            return res.json([]); // El usuario todavía no tiene carrito creado
        }
        const id_carrito = carritoRows[0].id_carrito;

        const [items] = await db.query(`
            SELECT
                dc.id_producto,
                p.nombre AS nombre_producto,
                COALESCE(c.nombre, 'General') AS categoria,
                dc.precio,
                dc.cantidad,
                p.stock
            FROM detalle_carrito dc
            JOIN producto p ON dc.id_producto = p.id_producto
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE dc.id_carrito = ?
        `, [id_carrito]);

        res.json(items);
    } catch (error) {
        console.error("Error obteniendo el carrito:", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

// ── CARRITO: actualizar la cantidad de un producto ────────────────────
app.put('/api/carrito/actualizar', async (req, res) => {
    let conexion;
    try {
        const { usuario_id, producto_id, cantidad } = req.body;
        if (!usuario_id || !producto_id || !cantidad) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [carritoRows] = await conexion.query('SELECT id_carrito FROM carrito WHERE id_usuario = ?', [usuario_id]);
        if (carritoRows.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: "El usuario no tiene carrito" });
        }
        const id_carrito = carritoRows[0].id_carrito;

        await conexion.query(
            'UPDATE detalle_carrito SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?',
            [cantidad, id_carrito, producto_id]
        );

        const [totalRows] = await conexion.query(
            'SELECT SUM(cantidad * precio) AS total FROM detalle_carrito WHERE id_carrito = ?',
            [id_carrito]
        );
        await conexion.query('UPDATE carrito SET total = ? WHERE id_carrito = ?', [totalRows[0].total || 0, id_carrito]);

        await conexion.commit();
        res.json({ mensaje: "Cantidad actualizada" });

    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error("Error actualizando cantidad:", error);
        res.status(500).json({ error: "Error al actualizar la cantidad" });
    } finally {
        if (conexion) conexion.release();
    }
});

// ── CARRITO: eliminar un producto ──────────────────────────────────────
app.delete('/api/carrito/eliminar', async (req, res) => {
    let conexion;
    try {
        const { usuario_id, producto_id } = req.body;
        if (!usuario_id || !producto_id) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [carritoRows] = await conexion.query('SELECT id_carrito FROM carrito WHERE id_usuario = ?', [usuario_id]);
        if (carritoRows.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: "El usuario no tiene carrito" });
        }
        const id_carrito = carritoRows[0].id_carrito;

        await conexion.query('DELETE FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?', [id_carrito, producto_id]);

        const [totalRows] = await conexion.query(
            'SELECT SUM(cantidad * precio) AS total FROM detalle_carrito WHERE id_carrito = ?',
            [id_carrito]
        );
        await conexion.query('UPDATE carrito SET total = ? WHERE id_carrito = ?', [totalRows[0].total || 0, id_carrito]);

        await conexion.commit();
        res.json({ mensaje: "Producto eliminado del carrito" });

    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error("Error eliminando del carrito:", error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    } finally {
        if (conexion) conexion.release();
    }
});

// ── PEDIDOS: crear pedido desde el carrito ──────────────────────────
app.post('/api/ordenes/crear', async (req, res) => {
    let conexion;
    try {
        const { usuario_id, direccion, ciudad, metodo_pago, costo_envio, total } = req.body;
        if (!usuario_id || !direccion || !ciudad) {
            return res.status(400).json({ error: 'Faltan datos de envío' });
        }

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [carritoRows] = await conexion.query(
            'SELECT id_carrito FROM carrito WHERE id_usuario = ?',
            [usuario_id]
        );
        if (carritoRows.length === 0) throw new Error('El carrito está vacío');

        const [items] = await conexion.query(
            'SELECT id_producto, cantidad, precio FROM detalle_carrito WHERE id_carrito = ?',
            [carritoRows[0].id_carrito]
        );
        if (items.length === 0) throw new Error('El carrito está vacío');

        const [compra] = await conexion.query(
            'INSERT INTO compra (id_usuario) VALUES (?)',
            [usuario_id]
        );
        const idCompra = compra.insertId;

        for (const item of items) {
            await conexion.query(
                'INSERT INTO detalle_compra (id_compra, id_producto, cantidad, Precio) VALUES (?, ?, ?, ?)',
                [idCompra, item.id_producto, item.cantidad, item.precio]
            );
        }

        await conexion.query(
            'INSERT INTO factura (impuestos, costo_envio, total_final, id_compra) VALUES (?, ?, ?, ?)',
            [0, Number(costo_envio) || 0, Number(total) || 0, idCompra]
        );

        const metodosPago = {
            tarjeta: 'Tarjeta de credito',
            pse: 'Transferencia bancaria',
            efectivo: 'Efectivo'
        };
        const [duenos] = await conexion.query('SELECT id_dueno FROM dueno LIMIT 1');
        if (duenos.length > 0) {
            await conexion.query(
                `INSERT INTO venta (estado, metodo_pago, id_usuario, id_dueno, id_compra)
                 VALUES ('Pendiente', ?, ?, ?, ?)`,
                [metodosPago[metodo_pago] || 'Efectivo', usuario_id, duenos[0].id_dueno, idCompra]
            );
        }

        await conexion.query(
            'UPDATE usuario SET direccion = ? WHERE id_usuario = ?',
            [`${direccion}, ${ciudad}`, usuario_id]
        );
        await conexion.query('DELETE FROM detalle_carrito WHERE id_carrito = ?', [carritoRows[0].id_carrito]);
        await conexion.query('UPDATE carrito SET total = 0 WHERE id_carrito = ?', [carritoRows[0].id_carrito]);

        await conexion.commit();
        res.status(201).json({ mensaje: 'Pedido creado', id_orden: idCompra });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error creando pedido:', error);
        res.status(500).json({ error: error.message || 'Error al crear el pedido' });
    } finally {
        if (conexion) conexion.release();
    }
});

// ── PEDIDOS: listar pedidos del usuario ─────────────────────────────
app.get('/api/pedidos/:usuario_id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id_compra, DATE_FORMAT(c.fecha_compra, '%Y-%m-%d') AS fecha,
                   COALESCE(f.total_final, SUM(dc.cantidad * dc.Precio), 0) AS total,
                   COALESCE(v.estado, 'Pendiente') AS estado,
                   COALESCE(v.metodo_pago, 'No especificado') AS metodo
            FROM compra c
            LEFT JOIN detalle_compra dc ON dc.id_compra = c.id_compra
            LEFT JOIN factura f ON f.id_compra = c.id_compra
            LEFT JOIN venta v ON v.id_compra = c.id_compra
            WHERE c.id_usuario = ?
            GROUP BY c.id_compra, c.fecha_compra, f.total_final, v.estado, v.metodo_pago
            ORDER BY c.fecha_compra DESC, c.id_compra DESC
        `, [req.params.usuario_id]);

        const pedidos = await Promise.all(rows.map(async (pedido) => {
            const [items] = await db.query(`
                SELECT p.nombre, dc.cantidad, dc.Precio AS precio
                FROM detalle_compra dc
                JOIN producto p ON p.id_producto = dc.id_producto
                WHERE dc.id_compra = ?
            `, [pedido.id_compra]);
            return {
                id: `#CP-${pedido.id_compra}`,
                fecha: pedido.fecha,
                metodo: pedido.metodo,
                estado: pedido.estado,
                total: Number(pedido.total),
                items: items.map(item => ({ ...item, precio: Number(item.precio), variante: 'Producto' }))
            };
        }));
        res.json(pedidos);
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

async function consultarFacturas(usuarioId, idCompra = null) {
    const parametros = [usuarioId];
    let filtro = 'c.id_usuario = ?';
    if (idCompra) {
        filtro += ' AND c.id_compra = ?';
        parametros.push(idCompra);
    }

    const [facturas] = await db.query(`
        SELECT f.id_factura AS id, CONCAT('#FAC-', f.id_factura) AS factura_id,
               c.id_compra AS pedido_id, DATE_FORMAT(c.fecha_compra, '%Y-%m-%d') AS fecha_compra,
               f.total_final AS total, COALESCE(v.estado, 'Pendiente') AS estado,
               COALESCE(v.metodo_pago, 'No especificado') AS metodo_pago,
               u.nombre, u.apellido, u.correo, u.direccion, u.codigo_postal
        FROM factura f
        JOIN compra c ON c.id_compra = f.id_compra
        JOIN usuario u ON u.id_usuario = c.id_usuario
        LEFT JOIN venta v ON v.id_compra = c.id_compra
        WHERE ${filtro}
        ORDER BY c.id_compra DESC
    `, parametros);

    return Promise.all(facturas.map(async factura => {
        const [items] = await db.query(`
            SELECT p.nombre, dc.cantidad, dc.Precio AS precio
            FROM detalle_compra dc
            JOIN producto p ON p.id_producto = dc.id_producto
            WHERE dc.id_compra = ?
        `, [factura.pedido_id]);
        return {
            ...factura,
            total: Number(factura.total || 0),
            comprador: {
                nombre: `${factura.nombre || ''} ${factura.apellido || ''}`.trim(),
                correo: factura.correo,
                dir: factura.direccion,
                postal: factura.codigo_postal
            },
            vendedor: 'TT&DT',
            items: items.map(item => ({ ...item, precio: Number(item.precio), variante: 'Producto' }))
        };
    }));
}

app.get('/api/facturas/pedido/:id', async (req, res) => {
    try {
        const [factura] = await consultarFacturas(req.query.usuario_id || 0, req.params.id);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(factura);
    } catch (error) {
        console.error('Error obteniendo factura:', error);
        res.status(500).json({ error: 'Error al obtener la factura' });
    }
});

app.get('/api/facturas/usuario/:id', async (req, res) => {
    try {
        res.json(await consultarFacturas(req.params.id));
    } catch (error) {
        console.error('Error obteniendo facturas:', error);
        res.status(500).json({ error: 'Error al obtener las facturas' });
    }
});

app.get('/api/facturas/usuario/:id/ultima', async (req, res) => {
    try {
        const facturas = await consultarFacturas(req.params.id);
        if (!facturas.length) return res.status(404).json({ error: 'No hay facturas' });
        res.json(facturas[0]);
    } catch (error) {
        console.error('Error obteniendo última factura:', error);
        res.status(500).json({ error: 'Error al obtener la factura' });
    }
});

// ── PERFIL: obtener datos del usuario ────────────────────────────────
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            'SELECT id_usuario AS id, nombre, apellido, correo, telefono, bio, direccion, codigo_postal AS codigoPostal, foto_perfil AS fotoPerfil FROM usuario WHERE id_usuario = ?',
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
});

// ── PERFIL: subir foto de perfil ───────────────────────────────────
app.post('/api/usuarios/:id/foto', uploadFotoPerfil.single('foto'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen válida' });

        const [usuarios] = await db.query('SELECT foto_perfil FROM usuario WHERE id_usuario = ?', [req.params.id]);
        if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const fotoAnterior = usuarios[0].foto_perfil;
        const fotoPerfil = `/uploads/${req.file.filename}`;
        await db.query('UPDATE usuario SET foto_perfil = ? WHERE id_usuario = ?', [fotoPerfil, req.params.id]);

        if (fotoAnterior && fotoAnterior.startsWith('/uploads/')) {
            const archivoAnterior = path.join(__dirname, fotoAnterior.substring(1));
            if (fs.existsSync(archivoAnterior)) fs.unlinkSync(archivoAnterior);
        }

        res.json({ fotoPerfil });
    } catch (error) {
        console.error('Error subiendo foto de perfil:', error);
        res.status(500).json({ error: 'No se pudo guardar la foto de perfil' });
    }
});

// ── PERFIL: publicaciones y respuestas del usuario ────────────────
app.get('/api/usuarios/:id/publicaciones', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const [preguntas] = await db.query(`
            SELECT f.id_foro AS id, f.Titulo AS titulo, f.descripcion AS contenido,
                   COALESCE(c.nombre, 'General') AS categoria, f.fecha_creacion,
                   0 AS vistas
            FROM foro f
            LEFT JOIN categoria c ON c.id_categoria = f.id_categoria
            WHERE f.id_usuario = ?
            ORDER BY f.fecha_creacion DESC, f.id_foro DESC
        `, [usuarioId]);

        const [respuestas] = await db.query(`
            SELECT pf.id_publicacion_foro AS id, pf.id_foro, pf.contenido,
                   pf.fecha_creacion, f.Titulo AS titulo
            FROM publicacion_foro pf
            JOIN foro f ON f.id_foro = pf.id_foro
            WHERE pf.id_usuario = ? AND pf.estado_reportado = 0
            ORDER BY pf.fecha_creacion DESC, pf.id_publicacion_foro DESC
        `, [usuarioId]);

        res.json({ preguntas, respuestas });
    } catch (error) {
        console.error('Error obteniendo publicaciones del usuario:', error);
        res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }
});

// ── PERFIL: actualizar datos del usuario ─────────────────────────────
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, bio, direccion, codigoPostal } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        await db.query(
            'UPDATE usuario SET nombre = ?, apellido = ?, telefono = ?, bio = ?, direccion = ?, codigo_postal = ? WHERE id_usuario = ?',
            [nombre.trim(), (apellido || '').trim(), telefono || null, bio || null, direccion || '', codigoPostal || null, id]
        );
        res.json({ mensaje: "Perfil actualizado con éxito" });
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        res.status(500).json({ error: "Error al actualizar el perfil" });
    }
});

// ── INICIALIZACIÓN DEL SERVIDOR ───────────────────────────────────
// ── INICIALIZACIÓN DEL SERVIDOR ───────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor escuchando en el puerto ${PORT}`);
});