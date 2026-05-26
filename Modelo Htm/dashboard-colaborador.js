// ── VERIFICAR SESIÓN ──────────────────────────────────────────
function verificarSesion() {
    const sesion = JSON.parse(localStorage.getItem('sesionTT&DT'));
    if (!sesion || sesion.tipo !== 'vendedor') {
        alert('Acceso denegado. Debes iniciar sesión como colaborador/vendedor.');
        window.location.href = 'index.html';
        return;
    }
    // Actualizar nombre en header
    document.getElementById('nombre-header').textContent = sesion.nombre || 'Colaborador';
}

// ── FECHA DE HOY ─────────────────────────────────────────────
document.getElementById('fecha-hoy').textContent =
    new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ── DATOS SIMULADOS ──────────────────────────────────────────
const datos = {
    nombre_negocio:       'TechStore Pro',
    tipo_negocio:         'Electrónica',
    tasa_comision:        8,
    comision_mes:         1284.50,
    comision_pendiente:   320.00,
    proximo_pago:         '30 May 2024',

    ventas_mes:           16056.25,
    pedidos_activos:      23,
    productos_publicados: 47,
    rating_promedio:      4.7,

    ventas_recientes: [
        { id: 91, producto: 'Samsung Galaxy S24 Ultra', comprador: 'Carlos M.',  total: 1299.99, estado: 'Completada', fecha: '09/05/2024' },
        { id: 90, producto: 'AirPods Pro 2nd Gen',      comprador: 'Ana R.',     total: 499.98,  estado: 'En espera',  fecha: '08/05/2024' },
        { id: 89, producto: 'Logitech MX Master 3S',    comprador: 'Diego F.',   total: 99.99,   estado: 'Completada', fecha: '08/05/2024' },
        { id: 88, producto: 'Kit Arduino Starter Pro',  comprador: 'Laura S.',   total: 119.98,  estado: 'Pendiente',  fecha: '07/05/2024' },
        { id: 87, producto: 'iPad Pro 12.9" M2',        comprador: 'Mateo G.',   total: 1099.00, estado: 'Cancelada',  fecha: '07/05/2024' },
    ],

    alertas_stock: [
        { nombre: 'Kit Arduino Starter Pro', stock: 3 },
        { nombre: 'Logitech MX Master 3S',   stock: 5 },
        { nombre: 'Cable USB-C 2m',           stock: 2 },
    ],

    resenas_recientes: [
        { producto: 'Samsung Galaxy S24',  estrellas: 5, autor: 'Carlos M.', comentario: 'Excelente producto, llegó rápido.'     },
        { producto: 'AirPods Pro 2nd Gen', estrellas: 4, autor: 'Ana R.',    comentario: 'Muy buena calidad de sonido.'           },
        { producto: 'Kit Arduino',         estrellas: 5, autor: 'Diego F.',  comentario: 'Perfecto para aprender electrónica.'    },
    ],

    actividad: [
        { icono: '', texto: '<strong>Nueva venta</strong> — Samsung Galaxy S24 Ultra por $1,299.99',      tiempo: 'Hace 15 min' },
        { icono: '', texto: '<strong>Nueva reseña</strong> — AirPods Pro recibió 4 estrellas de Ana R.',   tiempo: 'Hace 1h'     },
        { icono: '', texto: '<strong>Stock actualizado</strong> — iPad Pro ajustado a 12 unidades',        tiempo: 'Hace 2h'     },
        { icono: '', texto: '<strong>Alerta de stock</strong> — Kit Arduino tiene solo 3 unidades',        tiempo: 'Hace 3h'     },
        { icono: '', texto: '<strong>Nueva venta</strong> — Logitech MX Master 3S por $99.99',             tiempo: 'Hace 4h'     },
        { icono: '', texto: '<strong>Pedido completado</strong> — Orden #87 entregada exitosamente',        tiempo: 'Hace 5h'     },
    ]
};

// ── NOMBRE EN HEADER ─────────────────────────────────────────
document.getElementById('nombre-header').textContent = datos.nombre_negocio;

// ── ANIMACIÓN CONTADORA ──────────────────────────────────────
function animarContador(id, valorFinal, esDinero, esDecimal) {
    const el = document.getElementById(id);
    const duracion = 1200;
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
        if (esDinero) {
            el.textContent = '$' + valorActual.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (esDecimal) {
            el.textContent = valorActual.toFixed(1);
        } else {
            el.textContent = Math.round(valorActual).toLocaleString('es-CO');
        }
    }, duracion / pasos);
}

function inicializarAnimaciones() {
    animarContador('val-ventas',    datos.ventas_mes,             true,  false);
    animarContador('val-pedidos',   datos.pedidos_activos,        false, false);
    animarContador('val-productos', datos.productos_publicados,   false, false);
    animarContador('val-rating',    datos.rating_promedio,        false, true);
}

// ── TABLA DE VENTAS ──────────────────────────────────────────
const claseEstado = {
    'Completada': 'estado-completada',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-cancelada',
    'En espera':  'estado-en-espera'
};

function inicializarTablaVentas() {
    const tablaVentas = document.getElementById('tabla-ventas');
    datos.ventas_recientes.forEach(function (v) {
        tablaVentas.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.producto}</td>
                <td>${v.comprador}</td>
                <td><strong>$${v.total.toFixed(2)}</strong></td>
                <td><span class="estado-badge ${claseEstado[v.estado] || ''}">${v.estado}</span></td>
                <td>${v.fecha}</td>
            </tr>
        `;
    });
}

// ── RESUMEN DE COMISIONES ────────────────────────────────────
function inicializarResumenComisiones() {
    const comisionesData = [
        { nombre: 'Comisión del mes',   valor: '$' + datos.comision_mes.toFixed(2),       color: 'var(--success)'  },
        { nombre: 'Pendiente de pago',  valor: '$' + datos.comision_pendiente.toFixed(2),  color: 'var(--warning)'  },
        { nombre: 'Tasa de comisión',   valor: datos.tasa_comision + '%',                  color: 'var(--accent-light)' },
        { nombre: 'Próximo pago',       valor: datos.proximo_pago,                          color: 'var(--info)'     },
        { nombre: 'Tipo de negocio',    valor: datos.tipo_negocio,                          color: 'var(--text-secondary)' },
    ];

    const resumenComisiones = document.getElementById('resumen-comisiones');
    comisionesData.forEach(function (item) {
        resumenComisiones.innerHTML += `
            <div class="usuario-tipo-fila">
                <span class="usuario-tipo-nombre">${item.nombre}</span>
                <span style="font-size:0.88rem; font-weight:700; color:${item.color};">${item.valor}</span>
            </div>
        `;
    });
}

// ── ALERTAS DE STOCK ─────────────────────────────────────────
function inicializarAlertasStock() {
    document.getElementById('badge-stock').textContent = datos.alertas_stock.length;

    const listaStock = document.getElementById('lista-stock');
    if (datos.alertas_stock.length === 0) {
        listaStock.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted);">Sin alertas de stock.</li>';
    } else {
        datos.alertas_stock.forEach(function (item) {
            listaStock.innerHTML += `
                <li class="dash-incidencia-item">
                    <p class="incidencia-titulo">${item.nombre}</p>
                    <p class="incidencia-meta">Solo quedan <strong style="color:var(--danger);">${item.stock} unidades</strong></p>
                </li>
            `;
        });
    }
}

// ── RESEÑAS RECIENTES ────────────────────────────────────────
function inicializarResenas() {
    const listaResenas = document.getElementById('lista-resenas');
    datos.resenas_recientes.forEach(function (r) {
        const estrellas = '★'.repeat(r.estrellas) + '☆'.repeat(5 - r.estrellas);
        listaResenas.innerHTML += `
            <li class="dash-incidencia-item" style="border-left-color: var(--warning);">
                <p class="incidencia-titulo">
                    <span style="color:var(--warning);">${estrellas}</span> — ${r.producto}
                </p>
                <p class="incidencia-meta">${r.autor}: "${r.comentario}"</p>
            </li>
        `;
    });
}

// ── ACTIVIDAD RECIENTE ───────────────────────────────────────
function inicializarActividad() {
    const listaActividad = document.getElementById('lista-actividad');
    datos.actividad.forEach(function (act) {
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
    document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
inicializarAnimaciones();
inicializarTablaVentas();
inicializarResumenComisiones();
inicializarAlertasStock();
inicializarResenas();
inicializarActividad();
inicializarCerrarSesion();
verificarSesion();
