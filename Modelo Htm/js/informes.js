// ── DATOS SIMULADOS ──────────────────────────────────────────
// (Espeja Informe_dueno, Informe_rendimiento, Venta de la BD)

const datosPorPeriodo = {
    semana:    { ingresos: 5820.50,  pedidos: 12,  usuarios: 8,   ticket: 485.04 },
    mes:       { ingresos: 24750.80, pedidos: 48,  usuarios: 32,  ticket: 515.64 },
    trimestre: { ingresos: 71320.40, pedidos: 134, usuarios: 89,  ticket: 532.24 },
    año:       { ingresos: 284100.00,pedidos: 512, usuarios: 310, ticket: 554.88 },
};

const ventasDiarias = [
    { dia: '1 May', valor: 820 },
    { dia: '2 May', valor: 1450 },
    { dia: '3 May', valor: 640 },
    { dia: '4 May', valor: 2100 },
    { dia: '5 May', valor: 980 },
    { dia: '6 May', valor: 1750 },
    { dia: '7 May', valor: 3200 },
    { dia: '8 May', valor: 1100 },
    { dia: '9 May', valor: 2800 },
];

const topProductos = [
    { nombre: 'Samsung Galaxy S24 Ultra', ventas: 38, pct: 100 },
    { nombre: 'MacBook Pro 14" M3',       ventas: 22, pct: 58  },
    { nombre: 'AirPods Pro 2nd Gen',       ventas: 19, pct: 50  },
    { nombre: 'Logitech MX Master 3S',     ventas: 14, pct: 37  },
    { nombre: 'iPad Pro 12.9" M2',         ventas: 9,  pct: 24  },
];

const metodosPago = [
    { nombre: 'Tarjeta crédito', pct: 42, color: '#7c3aed' },
    { nombre: 'PSE',             pct: 28, color: '#2563eb' },
    { nombre: 'Tarjeta débito',  pct: 18, color: '#22c55e' },
    { nombre: 'Efectivo',        pct: 12, color: '#f59e0b' },
];

const tecnicos = [
    { nombre: 'Juan',   tareasComp: 12, incidencias: 5, tiempo: '1.8h', eval: 5 },
    { nombre: 'María',  tareasComp: 9,  incidencias: 7, tiempo: '2.1h', eval: 4 },
    { nombre: 'Carlos', tareasComp: 10, incidencias: 4, tiempo: '2.4h', eval: 4 },
];

const categorias = [
    { nombre: 'Smartphones', ventas: 8200, pct: 100, color: '#7c3aed' },
    { nombre: 'Laptops',     ventas: 5990, pct: 73,  color: '#2563eb' },
    { nombre: 'Audio',       ventas: 3480, pct: 42,  color: '#22c55e' },
    { nombre: 'Tablets',     ventas: 2200, pct: 27,  color: '#f59e0b' },
    { nombre: 'Accesorios',  ventas: 1400, pct: 17,  color: '#ef4444' },
    { nombre: 'Robótica',    ventas: 720,  pct: 9,   color: '#06b6d4' },
];

let informes = [
    { id: 1, rango: 'Abril 2026',  fecha: '30/04/2026', formato: 'PDF',   notas: 'Mes con mayor crecimiento en smartphones.' },
    { id: 2, rango: 'Q1 2026',     fecha: '31/03/2026', formato: 'Excel', notas: 'Revisión trimestral completa.' },
    { id: 3, rango: 'Marzo 2026',  fecha: '28/03/2026', formato: 'PDF',   notas: 'Stock bajo en robótica. Pendiente reabastecimiento.' },
];

// ── KPIs ─────────────────────────────────────────────────────
function actualizarKPIs(periodo) {
    const d = datosPorPeriodo[periodo];
    document.getElementById('kpi-ingresos').textContent = '$' + d.ingresos.toLocaleString('es-CO', { minimumFractionDigits: 2 });
    document.getElementById('kpi-pedidos').textContent  = d.pedidos;
    document.getElementById('kpi-usuarios').textContent = d.usuarios;
    document.getElementById('kpi-ticket').textContent   = '$' + d.ticket.toLocaleString('es-CO', { minimumFractionDigits: 2 });
}

// ── GRÁFICO DE BARRAS ────────────────────────────────────────
function renderizarGrafico() {
    const area   = document.getElementById('chart-ventas');
    const labels = document.getElementById('chart-labels');
    area.innerHTML = ''; labels.innerHTML = '';
    const maxVal = Math.max(...ventasDiarias.map(v => v.valor));

    ventasDiarias.forEach(function(v) {
        const pct = Math.round((v.valor / maxVal) * 100);
        area.innerHTML += `
            <div class="inf-barra-wrap">
                <span class="inf-barra-val">$${(v.valor/1000).toFixed(1)}k</span>
                <div class="inf-barra" style="--barra-height: ${pct}%;"></div>
            </div>
        `;
        labels.innerHTML += `<span class="inf-chart-label">${v.dia}</span>`;
    });
}

// ── TOP PRODUCTOS ────────────────────────────────────────────
function renderizarTopProductos() {
    const lista = document.getElementById('inf-top-productos');
    lista.innerHTML = '';
    topProductos.forEach(function(p, i) {
        lista.innerHTML += `
            <li class="inf-top-item">
                <span class="inf-top-num">${i + 1}</span>
                <div class="inf-top-info">
                    <p class="inf-top-nombre">${p.nombre}</p>
                    <div class="inf-top-barra-wrap">
                        <div class="inf-top-barra" style="--top-barra-width: ${p.pct}%;"></div>
                    </div>
                </div>
                <span class="inf-top-ventas">${p.ventas} uds.</span>
            </li>
        `;
    });
}

// ── MÉTODOS DE PAGO ──────────────────────────────────────────
function renderizarMetodos() {
    const cont = document.getElementById('inf-metodos');
    cont.innerHTML = '';
    metodosPago.forEach(function(m) {
        cont.innerHTML += `
            <div class="inf-metodo-fila">
                <span class="inf-metodo-nombre">${m.nombre}</span>
                <div class="inf-metodo-barra-wrap">
                    <div class="inf-metodo-barra" style="--metodo-width: ${m.pct}%; --metodo-color: ${m.color};"></div>
                </div>
                <span class="inf-metodo-pct">${m.pct}%</span>
            </div>
        `;
    });
}

// ── TÉCNICOS ─────────────────────────────────────────────────
function renderizarTecnicos() {
    const tbody = document.getElementById('inf-tabla-tecnicos');
    tbody.innerHTML = '';
    tecnicos.forEach(function(t) {
        const estrellas = '★'.repeat(t.eval) + '☆'.repeat(5 - t.eval);
        tbody.innerHTML += `
            <tr>
                <td><strong>Técnico: ${t.nombre}</strong></td>
                <td>${t.tareasComp} tareas</td>
                <td>${t.incidencias} resueltas</td>
                <td>${t.tiempo} promedio</td>
                <td><span class="eval-estrellas">${estrellas}</span></td>
            </tr>
        `;
    });
}

// ── CATEGORÍAS ───────────────────────────────────────────────
function renderizarCategorias() {
    const cont = document.getElementById('inf-categorias');
    cont.innerHTML = '';
    categorias.forEach(function(c) {
        cont.innerHTML += `
            <div class="inf-cat-fila">
                <span class="inf-cat-nombre">${c.nombre}</span>
                <div class="inf-cat-barra-wrap">
                    <div class="inf-cat-barra" style="--cat-width: ${c.pct}%; --cat-color: ${c.color};"></div>
                </div>
                <span class="inf-cat-val">$${(c.ventas/1000).toFixed(1)}k</span>
            </div>
        `;
    });
}

// ── TABLA INFORMES ───────────────────────────────────────────
function renderizarInformes() {
    const tbody = document.getElementById('inf-tabla-informes');
    tbody.innerHTML = '';
    informes.forEach(function(inf) {
        tbody.innerHTML += `
            <tr>
                <td><strong>#${inf.id}</strong></td>
                <td>${inf.rango}</td>
                <td class="inf-td-meta">${inf.fecha}</td>
                <td><span class="inf-formato-badge">${inf.formato}</span></td>
                <td class="inf-td-notas">${inf.notas}</td>
                <td><button class="btn-descargar" onclick="alert('Descargando informe ${inf.rango}...')">⬇ Descargar</button></td>
            </tr>
        `;
    });
}

// ── MODAL NUEVO INFORME ──────────────────────────────────────
function inicializarModalInforme() {
    document.getElementById('btn-nuevo-informe').addEventListener('click', function() {
        document.getElementById('ni-notas').value = '';
        document.getElementById('modal-informe').style.display = 'flex';
    });

    document.getElementById('btn-generar').addEventListener('click', function() {
        document.getElementById('ni-notas').value = '';
        document.getElementById('modal-informe').style.display = 'flex';
    });

    document.getElementById('btn-guardar-inf').addEventListener('click', function() {
        const rango   = document.getElementById('ni-rango').value;
        const formato = document.getElementById('ni-formato').value;
        const notas   = document.getElementById('ni-notas').value.trim() || '—';
        const hoy = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
        const nuevoId = informes.length > 0 ? Math.max(...informes.map(i => i.id)) + 1 : 1;
        informes.unshift({ id: nuevoId, rango, fecha: hoy, formato, notas });
        renderizarInformes();
        document.getElementById('modal-informe').style.display = 'none';
        alert(`Informe de ${rango} generado en formato ${formato}.`);
    });

    ['btn-cerrar-inf','btn-cancelar-inf'].forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            document.getElementById('modal-informe').style.display = 'none';
        });
    });

    document.getElementById('modal-informe').addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
}

// ── CAMBIO DE PERÍODO ────────────────────────────────────────
function inicializarCambioPeriodo() {
    document.getElementById('inf-periodo').addEventListener('change', function() {
        actualizarKPIs(this.value);
    });
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
function inicializarInformes() {
    actualizarKPIs('mes');
    renderizarGrafico();
    renderizarTopProductos();
    renderizarMetodos();
    renderizarTecnicos();
    renderizarCategorias();
    renderizarInformes();
    inicializarModalInforme();
    inicializarCambioPeriodo();
    inicializarCerrarSesion();
    verificarSesion();
}

// Ejecutar inicialización
inicializarInformes();
