// ── DATOS SIMULADOS (espeja tabla Tarea de la BD) ────────────
let tareas = [
    { id: 1, descripcion: 'Revisar incidencias de login',         tecnico: 'Juan',   prioridad: 'alta',  estado: 'Pendiente',  fechaAsig: '07/05/2026', fechaLim: '10/05/2026' },
    { id: 2, descripcion: 'Actualizar stock de Robótica',          tecnico: 'María',  prioridad: 'media', estado: 'En proceso', fechaAsig: '06/05/2026', fechaLim: '11/05/2026' },
    { id: 3, descripcion: 'Generar informe mensual de ventas',     tecnico: 'Carlos', prioridad: 'media', estado: 'Pendiente',  fechaAsig: '05/05/2026', fechaLim: '12/05/2026' },
    { id: 4, descripcion: 'Verificar pruebas automatizadas',       tecnico: 'Juan',   prioridad: 'baja',  estado: 'Terminado',  fechaAsig: '03/05/2026', fechaLim: '08/05/2026' },
    { id: 5, descripcion: 'Moderar publicaciones del foro',        tecnico: 'María',  prioridad: 'baja',  estado: 'Terminado',  fechaAsig: '01/05/2026', fechaLim: '05/05/2026' },
    { id: 6, descripcion: 'Revisar error de pago con PSE',         tecnico: 'Carlos', prioridad: 'alta',  estado: 'En proceso', fechaAsig: '08/05/2026', fechaLim: '09/05/2026' },
];

let tareasFiltradas = [...tareas];
let modoEdicion = false;
let idEdicion = null;

// ── STATS ────────────────────────────────────────────────────
function actualizarStats() {
    document.getElementById('st-total').textContent     = tareas.length;
    document.getElementById('st-pendiente').textContent = tareas.filter(t => t.estado === 'Pendiente').length;
    document.getElementById('st-proceso').textContent   = tareas.filter(t => t.estado === 'En proceso').length;
    document.getElementById('st-terminado').textContent = tareas.filter(t => t.estado === 'Terminado').length;
}

// ── KANBAN ───────────────────────────────────────────────────
function renderizarKanban() {
    const cols = { 'Pendiente': 'col-pendiente', 'En proceso': 'col-proceso', 'Terminado': 'col-terminado' };
    const badges = { 'Pendiente': 'badge-pendiente', 'En proceso': 'badge-proceso', 'Terminado': 'badge-terminado' };

    Object.values(cols).forEach(id => document.getElementById(id).innerHTML = '');

    const counts = { 'Pendiente': 0, 'En proceso': 0, 'Terminado': 0 };

    tareasFiltradas.forEach(function(t) {
        const contenedor = document.getElementById(cols[t.estado]);
        if (!contenedor) return;
        counts[t.estado]++;

        const card = document.createElement('div');
        card.className = 'gt-card';
        card.onclick = () => abrirEdicion(t.id);
        card.innerHTML = `
            <p class="gt-card-desc">${t.descripcion}</p>
            <div class="gt-card-meta">
                <span class="gt-card-tecnico">
                    <span class="gt-prioridad-dot dot-${t.prioridad}"></span>
                    Técnico: ${t.tecnico}
                </span>
                <span class="gt-card-fecha">⏰ ${t.fechaLim}</span>
            </div>
        `;
        contenedor.appendChild(card);
    });

    Object.entries(counts).forEach(([estado, n]) => {
        document.getElementById(badges[estado]).textContent = n;
    });
}

// ── TABLA ────────────────────────────────────────────────────
function renderizarTabla() {
    const tbody = document.getElementById('gt-tabla-body');
    tbody.innerHTML = '';

    if (tareasFiltradas.length === 0) {
        document.getElementById('gt-sin-resultados').style.display = 'block';
        return;
    }
    document.getElementById('gt-sin-resultados').style.display = 'none';

    tareasFiltradas.forEach(function(t) {
        const claseEst = 'est-' + t.estado;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${t.id}</strong></td>
            <td style="max-width:280px;">${t.descripcion}</td>
            <td>Técnico: ${t.tecnico}</td>
            <td>
                <span class="badge-prioridad pri-${t.prioridad}">
                    <span class="gt-prioridad-dot dot-${t.prioridad}"></span>
                    ${t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1)}
                </span>
            </td>
            <td><span class="badge-estado ${claseEst}">${t.estado}</span></td>
            <td style="color:var(--text-muted); font-size:0.82rem;">${t.fechaAsig}</td>
            <td style="color:var(--text-muted); font-size:0.82rem;">${t.fechaLim}</td>
            <td>
                <button class="btn-accion btn-editar-t"   onclick="abrirEdicion(${t.id})">Editar</button>
                <button class="btn-accion btn-eliminar-t" onclick="eliminarTarea(${t.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ── FILTRAR ──────────────────────────────────────────────────
function filtrar() {
    const texto    = document.getElementById('gt-busqueda').value.toLowerCase().trim();
    const estado   = document.getElementById('gt-filtro-estado').value;
    const prioridad= document.getElementById('gt-filtro-prioridad').value;
    const tecnico  = document.getElementById('gt-filtro-tecnico').value;

    tareasFiltradas = tareas.filter(function(t) {
        return (!texto    || t.descripcion.toLowerCase().includes(texto)) &&
               (!estado   || t.estado    === estado) &&
               (!prioridad|| t.prioridad === prioridad) &&
               (!tecnico  || t.tecnico   === tecnico);
    });

    renderizarKanban();
    renderizarTabla();
}

// ── ELIMINAR ─────────────────────────────────────────────────
function eliminarTarea(id) {
    const t = tareas.find(x => x.id === id);
    if (confirm(`¿Eliminar la tarea "${t.descripcion.substring(0,40)}..."?`)) {
        tareas = tareas.filter(x => x.id !== id);
        actualizarStats();
        filtrar();
    }
}

// ── MODAL ────────────────────────────────────────────────────
function abrirModal(limpiar = true) {
    if (limpiar) {
        document.getElementById('modal-tarea-titulo').textContent = 'Nueva Tarea';
        document.getElementById('mt-descripcion').value = '';
        document.getElementById('mt-tecnico').value    = '';
        document.getElementById('mt-prioridad').value  = '';
        document.getElementById('mt-estado').value     = 'Pendiente';
        document.getElementById('mt-fecha-limite').value = '';
        limpiarErrores();
    }
    document.getElementById('modal-tarea').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-tarea').style.display = 'none';
    modoEdicion = false; idEdicion = null;
}

function abrirEdicion(id) {
    const t = tareas.find(x => x.id === id);
    if (!t) return;
    modoEdicion = true; idEdicion = id;
    document.getElementById('modal-tarea-titulo').textContent = 'Editar Tarea';
    document.getElementById('mt-descripcion').value = t.descripcion;
    document.getElementById('mt-tecnico').value    = t.tecnico;
    document.getElementById('mt-prioridad').value  = t.prioridad;
    document.getElementById('mt-estado').value     = t.estado;
    // Convertir fecha dd/mm/yyyy → yyyy-mm-dd para el input date
    const [d, m, y] = t.fechaLim.split('/');
    document.getElementById('mt-fecha-limite').value = `${y}-${m}-${d}`;
    limpiarErrores();
    abrirModal(false);
}

function limpiarErrores() {
    ['err-mt-desc','err-mt-tecnico','err-mt-prioridad','err-mt-fecha'].forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

function inicializarModalTarea() {
    document.getElementById('btn-guardar-tarea').addEventListener('click', function() {
        limpiarErrores();
        let ok = true;
        const desc     = document.getElementById('mt-descripcion').value.trim();
        const tecnico  = document.getElementById('mt-tecnico').value;
        const prioridad= document.getElementById('mt-prioridad').value;
        const estado   = document.getElementById('mt-estado').value;
        const fechaRaw = document.getElementById('mt-fecha-limite').value;

        if (!desc)     { document.getElementById('err-mt-desc').textContent     = 'Campo requerido.';      ok = false; }
        if (!tecnico)  { document.getElementById('err-mt-tecnico').textContent  = 'Selecciona un técnico.';ok = false; }
        if (!prioridad){ document.getElementById('err-mt-prioridad').textContent= 'Selecciona prioridad.'; ok = false; }
        if (!fechaRaw) { document.getElementById('err-mt-fecha').textContent    = 'Campo requerido.';      ok = false; }
        if (!ok) return;

        // Convertir yyyy-mm-dd → dd/mm/yyyy
        const [y, m, d] = fechaRaw.split('-');
        const fechaLim = `${d}/${m}/${y}`;
        const hoy = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });

        if (modoEdicion) {
            const t = tareas.find(x => x.id === idEdicion);
            Object.assign(t, { descripcion: desc, tecnico, prioridad, estado, fechaLim });
        } else {
            const nuevoId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) + 1 : 1;
            tareas.push({ id: nuevoId, descripcion: desc, tecnico, prioridad, estado, fechaAsig: hoy, fechaLim });
        }

        actualizarStats();
        filtrar();
        cerrarModal();
    });
}

// ── EVENTOS ──────────────────────────────────────────────────
function inicializarEventos() {
    document.getElementById('btn-abrir-modal').addEventListener('click',    () => { modoEdicion = false; abrirModal(); });
    document.getElementById('btn-cerrar-modal').addEventListener('click',   cerrarModal);
    document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
    document.getElementById('modal-tarea').addEventListener('click', function(e) { if (e.target === this) cerrarModal(); });

    document.getElementById('gt-busqueda').addEventListener('input', filtrar);
    document.getElementById('gt-filtro-estado').addEventListener('change', filtrar);
    document.getElementById('gt-filtro-prioridad').addEventListener('change', filtrar);
    document.getElementById('gt-filtro-tecnico').addEventListener('change', filtrar);
}

// ── VERIFICACIÓN DE SESIÓN ───────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'dueno') {
        // Si no está logueado o no es dueño, redirigir a login
        window.location.href = 'login.html';
    }
}

// ── CERRAR SESIÓN ────────────────────────────────────────────
function inicializarCerrarSesion() {
    document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
function inicializarGestionTareas() {
    actualizarStats();
    filtrar();
    inicializarModalTarea();
    inicializarEventos();
    inicializarCerrarSesion();
    verificarSesion();
}

// Ejecutar inicialización
inicializarGestionTareas();
