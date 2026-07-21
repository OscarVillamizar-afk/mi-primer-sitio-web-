const URL_API = "http://localhost:3000/api";

// ── 1. VERIFICAR SESIÓN ───────────────────────────────────────
function verificarSesion() {
    const sesion = JSON.parse(localStorage.getItem('sesionTT&DT'));
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!sesion || (sesion.tipo !== 'vendedor' && usuarioTipo !== 'colaborador')) {
        alert('Acceso denegado. Debes iniciar sesión como colaborador/vendedor.');
        window.location.href = 'index.html';
        return null;
    }

    const nombreHeader = document.getElementById('nombre-header');
    if (nombreHeader) {
        nombreHeader.textContent = sesion.nombre || 'Colaborador';
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
function animarContador(id, valorFinal, esDinero, esDecimal) {
    const el = document.getElementById(id);
    if (!el) return;

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

// ── 4. CARGAR MÉTRICAS Y DATOS DESDE MYSQL ───────────────────
async function cargarDashboardColaborador() {
    const sesion = verificarSesion();
    if (!sesion) return;

    const colaboradorId = sesion.id || localStorage.getItem('usuario_id');

    try {
        const respuesta = await fetch(`${URL_API}/colaborador/dashboard/${colaboradorId}`);
        if (!respuesta.ok) throw new Error("Error obteniendo datos del backend");

        const datos = await respuesta.json();

        // 1. Iniciar Animaciones con los datos reales
        animarContador('val-ventas',    datos.ventas_mes || 0,           true,  false);
        animarContador('val-pedidos',   datos.pedidos_activos || 0,      false, false);
        animarContador('val-productos', datos.productos_publicados || 0, false, false);
        animarContador('val-rating',    datos.rating_promedio || 0.0,    false, true);

        // 2. Renderizar Submódulos
        inicializarTablaVentas(datos.ventas_recientes || []);
        inicializarResumenComisiones(datos);
        inicializarAlertasStock(datos.alertas_stock || []);
        inicializarResenas(datos.resenas_recientes || []);
        inicializarActividad(datos.actividad || []);

    } catch (error) {
        console.error("Error al cargar el dashboard del colaborador:", error);
    }
}

// ── 5. TABLA DE VENTAS ───────────────────────────────────────
const claseEstado = {
    'Completada': 'estado-completada',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-cancelada',
    'En espera':  'estado-en-espera'
};

function inicializarTablaVentas(ventas) {
    const tablaVentas = document.getElementById('tabla-ventas');
    if (!tablaVentas) return;

    tablaVentas.innerHTML = ''; // Limpiar filas previas

    if (ventas.length === 0) {
        tablaVentas.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay ventas registradas este mes.</td></tr>';
        return;
    }

    ventas.forEach(function (v) {
        tablaVentas.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.producto}</td>
                <td>${v.comprador}</td>
                <td><strong>$${parseFloat(v.total).toFixed(2)}</strong></td>
                <td><span class="estado-badge ${claseEstado[v.estado] || ''}">${v.estado}</span></td>
                <td>${v.fecha}</td>
            </tr>
        `;
    });
}

// ── 6. RESUMEN DE COMISIONES ─────────────────────────────────
function inicializarResumenComisiones(datos) {
    const resumenComisiones = document.getElementById('resumen-comisiones');
    if (!resumenComisiones) return;

    const comisionesData = [
        { nombre: 'Comisión del mes',   valor: '$' + (datos.comision_mes || 0).toFixed(2),        color: 'var(--success)'  },
        { nombre: 'Pendiente de pago',  valor: '$' + (datos.comision_pendiente || 0).toFixed(2),  color: 'var(--warning)'  },
        { nombre: 'Tasa de comisión',   valor: (datos.tasa_comision || 8) + '%',                  color: 'var(--accent-light)' },
        { nombre: 'Próximo pago',       valor: datos.proximo_pago || 'N/A',                       color: 'var(--info)'     },
        { nombre: 'Tipo de negocio',    valor: datos.tipo_negocio || 'General',                   color: 'var(--text-secondary)' },
    ];

    resumenComisiones.innerHTML = '';
    comisionesData.forEach(function (item) {
        resumenComisiones.innerHTML += `
            <div class="usuario-tipo-fila">
                <span class="usuario-tipo-nombre">${item.nombre}</span>
                <span style="font-size:0.88rem; font-weight:700; color:${item.color};">${item.valor}</span>
            </div>
        `;
    });
}

// ── 7. ALERTAS DE STOCK ──────────────────────────────────────
function inicializarAlertasStock(alertas) {
    const badgeStock = document.getElementById('badge-stock');
    const listaStock = document.getElementById('lista-stock');

    if (badgeStock) badgeStock.textContent = alertas.length;
    if (!listaStock) return;

    listaStock.innerHTML = '';

    if (alertas.length === 0) {
        listaStock.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); list-style:none;">Sin alertas de stock.</li>';
    } else {
        alertas.forEach(function (item) {
            listaStock.innerHTML += `
                <li class="dash-incidencia-item">
                    <p class="incidencia-titulo">${item.nombre}</p>
                    <p class="incidencia-meta">Solo quedan <strong style="color:var(--danger);">${item.stock} unidades</strong></p>
                </li>
            `;
        });
    }
}

// ── 8. RESEÑAS RECIENTES ─────────────────────────────────────
function inicializarResenas(resenas) {
    const listaResenas = document.getElementById('lista-resenas');
    if (!listaResenas) return;

    listaResenas.innerHTML = '';

    if (resenas.length === 0) {
        listaResenas.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); list-style:none;">Sin reseñas recientes.</li>';
        return;
    }

    resenas.forEach(function (r) {
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

// ── 9. ACTIVIDAD RECIENTE ────────────────────────────────────
function inicializarActividad(actividades) {
    const listaActividad = document.getElementById('lista-actividad');
    if (!listaActividad) return;

    listaActividad.innerHTML = '';

    actividades.forEach(function (act) {
        listaActividad.innerHTML += `
            <li class="actividad-item">
                <div class="actividad-icono">${act.icono || ''}</div>
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
    cargarDashboardColaborador();
});