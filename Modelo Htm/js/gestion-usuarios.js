const URL_API = "http://localhost:3000/api";

let usuarios = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const POR_PAGINA = 5;
let modoEdicion = false;
let idEdicion = null;

// ── CARGAR USUARIOS DESDE LA BASE DE DATOS ────────────────────
async function cargarUsuariosDesdeBD() {
    try {
        const respuesta = await fetch(`${URL_API}/usuarios`);
        if (!respuesta.ok) throw new Error("Error al obtener usuarios");

        usuarios = await respuesta.json();
        actualizarStats();
        filtrar();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}

// ── RENDERIZAR TABLA ─────────────────────────────────────────
function renderizarTabla() {
    const tbody = document.getElementById('tabla-usuarios-body');
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    const pagina = usuariosFiltrados.slice(inicio, fin);

    tbody.innerHTML = '';

    document.getElementById('sin-usuarios').style.display = pagina.length === 0 ? 'block' : 'none';

    const tipoLabel = {
        'Dueno': 'Dueño',
        'Colaborador': 'Colaborador',
        'Tecnico_moderador': 'Tec. Moderador',
        'Proveedor': 'Proveedor',
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

    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / POR_PAGINA));
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
}

// ── ESTADÍSTICAS ─────────────────────────────────────────────
function actualizarStats() {
    const total     = usuarios.length;
    const activos   = usuarios.filter(u => u.estado === 'activo').length;
    const inactivos = usuarios.filter(u => u.estado === 'inactivo').length;
    const nuevos    = usuarios.filter(u => u.fecha >= '03/05/2026').length;

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-activos').textContent   = activos;
    document.getElementById('stat-inactivos').textContent = inactivos;
    document.getElementById('stat-nuevos').textContent    = nuevos;
}

// ── FILTRAR ──────────────────────────────────────────────────
function filtrar() {
    const texto  = document.getElementById('input-busqueda').value.toLowerCase().trim();
    const tipo   = document.getElementById('filtro-tipo').value;
    const estado = document.getElementById('filtro-estado').value;

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
async function toggleEstado(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = u.estado === 'activo' ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que deseas ${accion} a ${u.nombre} ${u.apellido}?`)) return;

    try {
        const respuesta = await fetch(`${URL_API}/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!respuesta.ok) throw new Error("Error al actualizar estado");

        u.estado = nuevoEstado;
        actualizarStats();
        filtrar();
    } catch (error) {
        console.error("Error cambiando estado:", error);
        alert("No se pudo cambiar el estado del usuario.");
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

document.getElementById('btn-guardar-modal').addEventListener('click', async function() {
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

    const payload = { nombre, apellido, correo, tipo, estado, direccion: dir, codigoPostal: cp, fechaNac: fnac };

    try {
        let respuesta;
        if (modoEdicion) {
            respuesta = await fetch(`${URL_API}/usuarios/${idEdicion}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            respuesta = await fetch(`${URL_API}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!respuesta.ok) {
            const err = await respuesta.json();
            throw new Error(err.error || "Error al guardar");
        }

        const data = await respuesta.json();
        if (!modoEdicion && data.password_temporal) {
            alert(`Usuario creado. Contraseña temporal: ${data.password_temporal}`);
        }

        await cargarUsuariosDesdeBD();
        cerrarModal();
    } catch (error) {
        console.error("Error guardando usuario:", error);
        alert(error.message || "No se pudo guardar el usuario.");
    }
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

// ── VERIFICACIÓN DE SESIÓN ───────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');
    if (!usuarioLogueado || usuarioTipo !== 'dueno') {
        window.location.href = 'login.html';
    }
}

function inicializarCerrarSesion() {
    document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// ── INICIALIZAR ──────────────────────────────────────────────
verificarSesion();
inicializarCerrarSesion();
cargarUsuariosDesdeBD();