// ── DATOS SIMULADOS ──────────────────────────────────────────
// (En producción vendrían de la tabla Usuario de la BD)
let usuarios = [
    { id: 1, nombre: 'Carlos',   apellido: 'Méndez',    correo: 'carlos@tt.com',   tipo: 'Dueno',             fecha: '01/01/2024', estado: 'activo' },
    { id: 2, nombre: 'Laura',    apellido: 'Rodríguez', correo: 'laura@tt.com',    tipo: 'Colaborador',       fecha: '05/02/2024', estado: 'activo' },
    { id: 3, nombre: 'Miguel',   apellido: 'García',    correo: 'miguel@tt.com',   tipo: 'Tecnico_moderador', fecha: '10/03/2024', estado: 'activo' },
    { id: 4, nombre: 'Ana',      apellido: 'Pérez',     correo: 'ana@tt.com',      tipo: 'Comprador',         fecha: '15/04/2024', estado: 'inactivo' },
    { id: 5, nombre: 'Juan',     apellido: 'Silva',     correo: 'juan@tt.com',     tipo: 'Comprador',         fecha: '20/04/2024', estado: 'activo' },
    { id: 6, nombre: 'María',    apellido: 'López',     correo: 'maria@tt.com',    tipo: 'Tecnico_moderador', fecha: '01/05/2026', estado: 'activo' },
    { id: 7, nombre: 'Pedro',    apellido: 'Gómez',     correo: 'pedro@tt.com',    tipo: 'Colaborador',       fecha: '03/05/2026', estado: 'inactivo' },
    { id: 8, nombre: 'Sofía',    apellido: 'Torres',    correo: 'sofia@tt.com',    tipo: 'Comprador',         fecha: '07/05/2026', estado: 'activo' },
];

let usuariosFiltrados = [...usuarios];
let paginaActual = 1;
const POR_PAGINA = 5;
let modoEdicion = false;
let idEdicion = null;

// ── RENDERIZAR TABLA ─────────────────────────────────────────
function renderizarTabla() {
    const tbody = document.getElementById('tabla-usuarios-body');
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    const pagina = usuariosFiltrados.slice(inicio, fin);

    tbody.innerHTML = '';

    if (pagina.length === 0) {
        document.getElementById('sin-usuarios').style.display = 'block';
    } else {
        document.getElementById('sin-usuarios').style.display = 'none';
    }

    const tipoLabel = {
        'Dueno': 'Dueño',
        'Colaborador': 'Colaborador',
        'Tecnico_moderador': 'Tec. Moderador',
        'Comprador': 'Comprador'
    };

    pagina.forEach(function(u) {
        const iniciales = u.nombre[0] + u.apellido[0];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${u.id}</strong></td>
            <td>
                <div class="gu-usuario-nombre">
                    <div class="gu-avatar">${iniciales}</div>
                    <div class="gu-usuario-texto">
                        <strong>${u.nombre} ${u.apellido}</strong>
                    </div>
                </div>
            </td>
            <td>${u.correo}</td>
            <td><span class="badge-tipo badge-${u.tipo}">${tipoLabel[u.tipo] || u.tipo}</span></td>
            <td>${u.fecha}</td>
            <td><span class="badge-${u.estado}">${u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button class="btn-accion btn-editar" onclick="abrirEdicion(${u.id})">Editar</button>
                <button class="btn-accion ${u.estado === 'activo' ? 'btn-toggle-activo' : 'btn-toggle-inactivo'}"
                    onclick="toggleEstado(${u.id})">
                    ${u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Actualizar paginación
    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
}

// ── ESTADÍSTICAS ─────────────────────────────────────────────
function actualizarStats() {
    const total    = usuarios.length;
    const activos  = usuarios.filter(u => u.estado === 'activo').length;
    const inactivos= usuarios.filter(u => u.estado === 'inactivo').length;
    // "nuevos esta semana": fecha >= 03/05/2026 (simulado)
    const nuevos   = usuarios.filter(u => u.fecha >= '03/05/2026').length;

    document.getElementById('stat-total').textContent    = total;
    document.getElementById('stat-activos').textContent  = activos;
    document.getElementById('stat-inactivos').textContent= inactivos;
    document.getElementById('stat-nuevos').textContent   = nuevos;
}

// ── FILTRAR ──────────────────────────────────────────────────
function filtrar() {
    const texto   = document.getElementById('input-busqueda').value.toLowerCase().trim();
    const tipo    = document.getElementById('filtro-tipo').value;
    const estado  = document.getElementById('filtro-estado').value;

    usuariosFiltrados = usuarios.filter(function(u) {
        const textoMatch = !texto ||
            u.nombre.toLowerCase().includes(texto) ||
            u.apellido.toLowerCase().includes(texto) ||
            u.correo.toLowerCase().includes(texto) ||
            String(u.id).includes(texto);
        const tipoMatch   = !tipo   || u.tipo   === tipo;
        const estadoMatch = !estado || u.estado === estado;
        return textoMatch && tipoMatch && estadoMatch;
    });

    paginaActual = 1;
    renderizarTabla();
}

// ── TOGGLE ESTADO ────────────────────────────────────────────
function toggleEstado(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    const accion = u.estado === 'activo' ? 'desactivar' : 'activar';
    if (confirm(`¿Seguro que deseas ${accion} a ${u.nombre} ${u.apellido}?`)) {
        u.estado = u.estado === 'activo' ? 'inactivo' : 'activo';
        actualizarStats();
        filtrar();
    }
}

// ── MODAL NUEVO ──────────────────────────────────────────────
function abrirModal(limpiar = true) {
    document.getElementById('modal-overlay').style.display = 'flex';
    if (limpiar) {
        document.getElementById('modal-titulo').textContent = 'Nuevo Usuario';
        ['m-nombre','m-apellido','m-correo','m-direccion','m-codigo-postal'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('m-tipo').value    = '';
        document.getElementById('m-estado').value  = 'activo';
        document.getElementById('m-fecha-nac').value = '';
        limpiarErrores();
    }
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    modoEdicion = false;
    idEdicion = null;
}

// ── MODAL EDICIÓN ────────────────────────────────────────────
function abrirEdicion(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    modoEdicion = true;
    idEdicion = id;
    document.getElementById('modal-titulo').textContent = 'Editar Usuario';
    document.getElementById('m-nombre').value  = u.nombre;
    document.getElementById('m-apellido').value= u.apellido;
    document.getElementById('m-correo').value  = u.correo;
    document.getElementById('m-tipo').value    = u.tipo;
    document.getElementById('m-estado').value  = u.estado;
    document.getElementById('m-direccion').value = u.direccion || '';
    document.getElementById('m-codigo-postal').value = u.codigoPostal || '';
    document.getElementById('m-fecha-nac').value = u.fechaNac || '';
    limpiarErrores();
    abrirModal(false);
}

// ── VALIDAR Y GUARDAR ────────────────────────────────────────
function limpiarErrores() {
    ['err-nombre','err-apellido','err-correo','err-tipo','err-direccion','err-fecha'].forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

document.getElementById('btn-guardar-modal').addEventListener('click', function() {
    limpiarErrores();
    let ok = true;

    const nombre  = document.getElementById('m-nombre').value.trim();
    const apellido= document.getElementById('m-apellido').value.trim();
    const correo  = document.getElementById('m-correo').value.trim();
    const tipo    = document.getElementById('m-tipo').value;
    const estado  = document.getElementById('m-estado').value;
    const dir     = document.getElementById('m-direccion').value.trim();
    const cp      = document.getElementById('m-codigo-postal').value.trim();
    const fnac    = document.getElementById('m-fecha-nac').value;

    if (!nombre)  { document.getElementById('err-nombre').textContent  = 'Campo requerido.'; ok = false; }
    if (!apellido){ document.getElementById('err-apellido').textContent= 'Campo requerido.'; ok = false; }
    if (!correo || !correo.includes('@')) {
        document.getElementById('err-correo').textContent = 'Correo inválido.'; ok = false;
    }
    if (!tipo)    { document.getElementById('err-tipo').textContent    = 'Selecciona un tipo.'; ok = false; }
    if (!dir)     { document.getElementById('err-direccion').textContent = 'Campo requerido.'; ok = false; }
    if (!fnac)    { document.getElementById('err-fecha').textContent   = 'Campo requerido.'; ok = false; }

    if (!ok) return;

    if (modoEdicion) {
        const u = usuarios.find(x => x.id === idEdicion);
        u.nombre = nombre; u.apellido = apellido; u.correo = correo;
        u.tipo = tipo; u.estado = estado; u.direccion = dir;
        u.codigoPostal = cp; u.fechaNac = fnac;
    } else {
        const nuevoId = Math.max(...usuarios.map(u => u.id)) + 1;
        const hoy = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
        usuarios.push({ id: nuevoId, nombre, apellido, correo, tipo, fecha: hoy, estado, direccion: dir, codigoPostal: cp, fechaNac: fnac });
    }

    actualizarStats();
    filtrar();
    cerrarModal();
});

// ── EVENTOS ──────────────────────────────────────────────────
document.getElementById('btn-abrir-modal').addEventListener('click',    () => abrirModal());
document.getElementById('btn-cerrar-modal').addEventListener('click',   cerrarModal);
document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
});

document.getElementById('btn-filtrar').addEventListener('click', filtrar);
document.getElementById('input-busqueda').addEventListener('input', filtrar);
document.getElementById('filtro-tipo').addEventListener('change', filtrar);
document.getElementById('filtro-estado').addEventListener('change', filtrar);

document.getElementById('btn-anterior').addEventListener('click', function() {
    if (paginaActual > 1) { paginaActual--; renderizarTabla(); }
});
document.getElementById('btn-siguiente').addEventListener('click', function() {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / POR_PAGINA);
    if (paginaActual < totalPaginas) { paginaActual++; renderizarTabla(); }
});

// ── INICIALIZAR ──────────────────────────────────────────────
actualizarStats();
filtrar();

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
document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

// Verificar sesión al cargar la página
verificarSesion();