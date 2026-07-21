const URL_API = "http://localhost:3000/api";

// ── 1. VERIFICAR SESIÓN DE ADMINISTRADOR ──────────────────────
function verificarSesionAdmin() {
    const sesion = JSON.parse(localStorage.getItem('sesionTT&DT'));
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!sesion || (sesion.tipo !== 'dueno' && usuarioTipo !== 'admin')) {
        alert('Acceso denegado. Se requieren permisos de administrador.');
        window.location.href = 'index.html';
        return null;
    }

    const nombreHeader = document.getElementById('nombre-header');
    if (nombreHeader) {
        nombreHeader.textContent = sesion.nombre || 'Administrador';
    }

    return sesion;
}

// ── 2. FECHA ACTUAL EN HEADER ─────────────────────────────────
const elFecha = document.getElementById('fecha-hoy');
if (elFecha) {
    elFecha.textContent = new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ── 3. ANIMACIÓN CONTADORA ───────────────────────────────────
function animarContador(id, valorFinal, esDinero) {
    const el = document.getElementById(id);
    if (!el) return;

    const pasos = 60;
    const incremento = valorFinal / pasos;
    let valorActual = 0;
    let paso = 0;

    const intervalo = setInterval(function () {
        paso++;
        valorActual += incremento;
        if (paso >= pasos) {
            valorActual = valorFinal;
            clearInterval(intervalo);
        }
        el.textContent = esDinero
            ? '$' + valorActual.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : Math.round(valorActual).toLocaleString('es-CO');
    }, 1200 / pasos);
}

// ── 4. CARGAR MÉTRICAS GENERALES DESDE MYSQL ─────────────────
async function cargarDashboardAdmin() {
    const sesion = verificarSesionAdmin();
    if (!sesion) return;

    try {
        const respuesta = await fetch(`${URL_API}/admin/dashboard`);
        if (!respuesta.ok) throw new Error("Error obteniendo datos del panel de control");

        const datos = await respuesta.json();

        // 1. Iniciar Animaciones
        animarContador('val-ventas',    datos.ventas_mes || 0,         true);
        animarContador('val-usuarios',  datos.usuarios_total || 0,     false);
        animarContador('val-productos', datos.productos_total || 0,    false);
        animarContador('val-pedidos',   datos.pedidos_pendientes || 0, false);

        // 2. Cargar Secciones
        inicializarTablaVentas(datos.ventas_recientes || []);
        inicializarTareas(datos.tareas || []);
        inicializarTiposUsuario(datos.tipos_usuario || []);
        inicializarIncidencias(datos.incidencias || []);
        inicializarActividad(datos.actividad || []);

    } catch (error) {
        console.error("Error al cargar datos del administrador:", error);
    }
}

// ── 5. TABLA DE VENTAS ───────────────────────────────────────
function inicializarTablaVentas(ventas) {
    const tablaVentas = document.getElementById('tabla-ventas');
    if (!tablaVentas) return;

    tablaVentas.innerHTML = '';

    if (ventas.length === 0) {
        tablaVentas.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay ventas registradas recientemente.</td></tr>';
        return;
    }

    ventas.forEach(function (v) {
        const claseEstado = {
            'Completada': 'estado-completada',
            'Pendiente':  'estado-pendiente',
            'Cancelada':  'estado-cancelada',
            'En espera':  'estado-en-espera'
        }[v.estado] || '';

        tablaVentas.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.cliente}</td>
                <td>${v.producto}</td>
                <td><strong>$${parseFloat(v.total).toFixed(2)}</strong></td>
                <td><span class="estado-badge ${claseEstado}">${v.estado}</span></td>
                <td>${v.fecha}</td>
            </tr>
        `;
    });
}

// ── 6. TAREAS ────────────────────────────────────────────────
function inicializarTareas(tareas) {
    const listaTareas = document.getElementById('lista-tareas');
    if (!listaTareas) return;

    listaTareas.innerHTML = '';

    if (tareas.length === 0) {
        listaTareas.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); list-style:none;">No hay tareas pendientes.</li>';
        return;
    }

    tareas.forEach(function (t) {
        listaTareas.innerHTML += `
            <li class="dash-tarea-item">
                <span class="tarea-prioridad prioridad-${t.prioridad}"></span>
                <span class="tarea-texto">${t.texto}</span>
                <span class="tarea-asignado">${t.asignado}</span>
            </li>
        `;
    });
}

// ── 7. DISTRIBUCIÓN DE TIPOS DE USUARIO ─────────────────────
function inicializarTiposUsuario(tipos) {
    const usuariosResumen = document.getElementById('usuarios-resumen');
    if (!usuariosResumen) return;

    usuariosResumen.innerHTML = '';

    const totalUsuarios = tipos.reduce((s, t) => s + t.cantidad, 0);
    if (totalUsuarios === 0) return;

    tipos.forEach(function (tipo) {
        const porcentaje = Math.round((tipo.cantidad / totalUsuarios) * 100);
        usuariosResumen.innerHTML += `
            <div class="usuario-tipo-fila">
                <span class="usuario-tipo-nombre">${tipo.nombre}</span>
                <div class="usuario-tipo-barra-wrap">
                    <div class="usuario-tipo-barra" style="--barra-width: ${porcentaje}%; --barra-color: ${tipo.color || '#7c3aed'};"></div>
                </div>
                <span class="usuario-tipo-num">${tipo.cantidad}</span>
            </div>
        `;
    });
}

// ── 8. INCIDENCIAS DEL SISTEMA ───────────────────────────────
function inicializarIncidencias(incidencias) {
    const badgeIncidencias = document.getElementById('badge-incidencias');
    const listaIncidencias = document.getElementById('lista-incidencias');

    if (badgeIncidencias) badgeIncidencias.textContent = incidencias.length;
    if (!listaIncidencias) return;

    listaIncidencias.innerHTML = '';

    if (incidencias.length === 0) {
        listaIncidencias.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); list-style:none;">Sin incidencias reportadas.</li>';
        return;
    }

    incidencias.forEach(function (inc) {
        listaIncidencias.innerHTML += `
            <li class="dash-incidencia-item">
                <p class="incidencia-titulo">${inc.titulo}</p>
                <p class="incidencia-meta">Módulo: ${inc.modulo} · ${inc.fecha}</p>
            </li>
        `;
    });
}

// ── 9. ACTIVIDAD RECIENTE ────────────────────────────────────
function inicializarActividad(actividades) {
    const listaActividad = document.getElementById('lista-actividad');
    if (!listaActividad) return;

    listaActividad.innerHTML = '';

    actividades.forEach(function (act) {
        listaActividad.innerHTML += `
            <li class="actividad-item">
                <div class="actividad-icono">${act.icono || '•'}</div>
                <p class="actividad-texto">${act.texto}</p>
                <span class="actividad-tiempo">${act.tiempo}</span>
            </li>
        `;
    });
}

// ── 10. CERRAR SESIÓN ────────────────────────────────────────
function inicializarCerrarSesion() {
    const btnCerrar = document.querySelector('a[href="index.html"] .btn-login') || document.querySelector('.btn-login');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

// ── INICIALIZACIÓN GENERAL ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    inicializarCerrarSesion();
    cargarDashboardAdmin();
});