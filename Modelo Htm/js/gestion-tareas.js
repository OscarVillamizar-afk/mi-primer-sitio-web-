// ── TAREAS ────────────────────────────────────────────────────────
app.get('/api/tareas/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const [tareas] = await db.query(`
            SELECT 
                t.id_tarea       AS id,
                t.descripcion,
                t.estado,
                t.prioridad,
                DATE_FORMAT(t.fecha_asignacion, '%d/%m/%Y') AS fechaAsig,
                DATE_FORMAT(t.fecha_limite, '%d/%m/%Y')     AS fechaLim,
                t.id_tecnico,
                CONCAT(u.nombre, ' ', u.apellido) AS tecnico
            FROM Tarea t
            JOIN Dueno d ON t.id_dueno = d.id_dueno
            JOIN Tecnico_moderador tm ON t.id_tecnico = tm.id_tecnico
            JOIN Usuario u ON tm.id_usuario = u.id_usuario
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
            FROM Tecnico_moderador tm
            JOIN Usuario u ON tm.id_usuario = u.id_usuario
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

        const [duenoRows] = await db.query('SELECT id_dueno FROM Dueno WHERE id_usuario = ?', [usuario_id]);
        if (duenoRows.length === 0) return res.status(404).json({ error: "Dueño no encontrado" });
        const id_dueno = duenoRows[0].id_dueno;

        const [resultado] = await db.query(
            `INSERT INTO Tarea (descripcion, estado, prioridad, fecha_limite, id_dueno, id_tecnico)
             VALUES (?, ?, ?, ?, ?, ?)`,
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
            `UPDATE Tarea 
             SET descripcion = ?, estado = ?, prioridad = ?, fecha_limite = ?, id_tecnico = ?
             WHERE id_tarea = ?`,
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
        await db.query('DELETE FROM Tarea WHERE id_tarea = ?', [id]);
        res.json({ mensaje: "Tarea eliminada con éxito" });
    } catch (error) {
        console.error("Error eliminando tarea:", error);
        res.status(500).json({ error: "Error al eliminar la tarea" });
    }
});