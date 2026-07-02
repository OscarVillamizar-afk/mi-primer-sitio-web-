// ── FECHA DE HOY ─────────────────────────────────────────────
const hoy = new Date();
document.getElementById('fecha-hoy').textContent =
    hoy.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ── DATOS SIMULADOS ──────────────────────────────────────────
const datos = {
    ventas_mes:         24750.80,
    usuarios_total:     142,
    productos_total:    38,
    pedidos_pendientes: 7,

    ventas_recientes: [
        { id: 1024, cliente: 'Carlos Méndez',   producto: 'Samsung Galaxy S24',  total: 1299.99, estado: 'Completada', fecha: '09/05/2026' },
        { id: 1023, cliente: 'Laura Rodríguez', producto: 'AirPods Pro 2nd Gen', total: 499.98,  estado: 'En espera',  fecha: '08/05/2026' },
        { id: 1022, cliente: 'Miguel García',   producto: 'MacBook Pro 14" M3',  total: 1999.00, estado: 'Completada', fecha: '08/05/2026' },
        { id: 1021, cliente: 'Ana Pérez',       producto: 'Logitech MX Master',  total: 99.99,   estado: 'Cancelada',  fecha: '07/05/2026' },
        { id: 1020, cliente: 'Juan Silva',      producto: 'Kit Arduino Pro',      total: 59.99,   estado: 'Pendiente',  fecha: '07/05/2026' },
    ],

    tareas: [
        { texto: 'Revisar incidencias de login',     asignado: 'Técnico: Juan',   prioridad: 'alta'  },
        { texto: 'Actualizar stock de Robótica',      asignado: 'Técnico: María',  prioridad: 'media' },
        { texto: 'Generar informe mensual de ventas', asignado: 'Técnico: Carlos', prioridad: 'media' },
        { texto: 'Verificar pruebas automatizadas',   asignado: 'Técnico: Juan',   prioridad: 'baja'  },
    ],

    tipos_usuario: [
        { nombre: 'Compradores',         cantidad: 98, color: '#7c3aed' },
        { nombre: 'Colaboradores',        cantidad: 24, color: '#2563eb' },
        { nombre: 'Técnicos Moderadores', cantidad: 12, color: '#22c55e' },
        { nombre: 'Dueños',              cantidad:  8, color: '#f59e0b' },
    ],

    incidencias: [
        { titulo: 'Error al procesar pago con PSE', modulo: 'Pagos',    fecha: 'Hace 1h'    },
        { titulo: 'Imagen de producto no carga',    modulo: 'Catálogo', fecha: 'Hace 3h'    },
        { titulo: 'Foro: respuestas duplicadas',    modulo: 'Foro',     fecha: 'Hace 1 día' },
    ],

    actividad: [
        { icono: 'U', texto: '<strong>Nuevo usuario</strong> registrado: Laura Torres',         tiempo: 'Hace 10 min' },
        { icono: 'V', texto: '<strong>Venta completada</strong> #1024 por $1,299.99',           tiempo: 'Hace 25 min' },
        { icono: 'I', texto: '<strong>Incidencia abierta</strong>: Error al procesar pago PSE', tiempo: 'Hace 1h'     },
        { icono: 'S', texto: '<strong>Stock bajo</strong> en iPad Pro 12.9" (2 unidades)',      tiempo: 'Hace 2h'     },
        { icono: 'T', texto: '<strong>Tarea completada</strong>: Revisión de drivers NVIDIA',   tiempo: 'Hace 3h'     },
        { icono: 'P', texto: '<strong>Nueva publicación</strong> en el foro: DDR5 en 2024',     tiempo: 'Hace 4h'     },
    ]
};

// ── MÉTRICAS CON ANIMACIÓN CONTADORA ────────────────────────
function animarContador(id, valorFinal, esDinero) {
    const el = document.getElementById(id);
    const pasos = 60;
    const incremento = valorFinal / pasos;
    let valorActual = 0;
    let paso = 0;

    const intervalo = setInterval(function() {
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

function inicializarAnimaciones() {
    animarContador('val-ventas',    datos.ventas_mes,         true);
    animarContador('val-usuarios',  datos.usuarios_total,     false);
    animarContador('val-productos', datos.productos_total,    false);
    animarContador('val-pedidos',   datos.pedidos_pendientes, false);
}

// ── TABLA DE VENTAS ──────────────────────────────────────────
function inicializarTablaVentas() {
    const tablaVentas = document.getElementById('tabla-ventas');
    datos.ventas_recientes.forEach(function(v) {
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
                <td><strong>$${v.total.toFixed(2)}</strong></td>
                <td><span class="estado-badge ${claseEstado}">${v.estado}</span></td>
                <td>${v.fecha}</td>
            </tr>
        `;
    });
}

// ── TAREAS ───────────────────────────────────────────────────
function inicializarTareas() {
    const listaTareas = document.getElementById('lista-tareas');
    datos.tareas.forEach(function(t) {
        listaTareas.innerHTML += `
            <li class="dash-tarea-item">
                <span class="tarea-prioridad prioridad-${t.prioridad}"></span>
                <span class="tarea-texto">${t.texto}</span>
                <span class="tarea-asignado">${t.asignado}</span>
            </li>
        `;
    });
}

// ── TIPOS DE USUARIO ─────────────────────────────────────────
function inicializarTiposUsuario() {
    const totalUsuarios = datos.tipos_usuario.reduce((s, t) => s + t.cantidad, 0);
    const usuariosResumen = document.getElementById('usuarios-resumen');
    datos.tipos_usuario.forEach(function(tipo) {
        const porcentaje = Math.round((tipo.cantidad / totalUsuarios) * 100);
        usuariosResumen.innerHTML += `
            <div class="usuario-tipo-fila">
                <span class="usuario-tipo-nombre">${tipo.nombre}</span>
                <div class="usuario-tipo-barra-wrap">
                    <div class="usuario-tipo-barra" style="--barra-width: ${porcentaje}%; --barra-color: ${tipo.color};"></div>
                </div>
                <span class="usuario-tipo-num">${tipo.cantidad}</span>
            </div>
        `;
    });
}

// ── INCIDENCIAS ──────────────────────────────────────────────
function inicializarIncidencias() {
    document.getElementById('badge-incidencias').textContent = datos.incidencias.length;
    const listaIncidencias = document.getElementById('lista-incidencias');
    datos.incidencias.forEach(function(inc) {
        listaIncidencias.innerHTML += `
            <li class="dash-incidencia-item">
                <p class="incidencia-titulo">${inc.titulo}</p>
                <p class="incidencia-meta">Módulo: ${inc.modulo} · ${inc.fecha}</p>
            </li>
        `;
    });
}

// ── ACTIVIDAD RECIENTE ───────────────────────────────────────
function inicializarActividad() {
    const listaActividad = document.getElementById('lista-actividad');
    datos.actividad.forEach(function(act) {
        listaActividad.innerHTML += `
            <li class="actividad-item">
                <div class="actividad-icono">${act.icono}</div>
                <p class="actividad-texto">${act.texto}</p>
                <span class="actividad-tiempo">${act.tiempo}</span>
            </li>
        `;
    });
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
inicializarAnimaciones();
inicializarTablaVentas();
inicializarTareas();
inicializarTiposUsuario();
inicializarIncidencias();
inicializarActividad();
inicializarCerrarSesion();
