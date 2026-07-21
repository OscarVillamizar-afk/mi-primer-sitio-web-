const URL_API = "http://localhost:3000/api";

let pedidos = [];

// ── VERIFICAR SESIÓN ──────────────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'usuario') {
        window.location.href = 'login.html';
    }
}

// ── CARGAR DATOS DE ENCABEZADO (nombre/avatar) ────────────────
function cargarEncabezado() {
    const nombre = localStorage.getItem('usuario_nombre') || '';
    const iniciales = nombre.trim().split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();

    if (document.getElementById('nombre-usuario'))    document.getElementById('nombre-usuario').textContent = nombre;
    if (document.getElementById('perfil-nombre'))     document.getElementById('perfil-nombre').textContent  = nombre;
    if (document.getElementById('avatar-iniciales'))  document.getElementById('avatar-iniciales').textContent = iniciales;
}

// ── CARGAR PEDIDOS DESDE LA BASE DE DATOS ─────────────────────
async function cargarPedidos() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
        console.warn("No hay ID de usuario en localStorage");
        return;
    }

    try {
        const respuesta = await fetch(`${URL_API}/pedidos/${usuarioId}`);
        if (!respuesta.ok) throw new Error("Error al obtener pedidos");
        pedidos = await respuesta.json();
        calcularStats();
        filtrarPedidos();
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    }
}

// ── STATS ──────────────────────────────────────────────────────
function calcularStats() {
    const totalPedidos = pedidos.length;
    const totalGastado = pedidos
        .filter(p => p.estado === 'Completada')
        .reduce((s, p) => s + p.total, 0);

    if (document.getElementById('stat-pedidos')) document.getElementById('stat-pedidos').textContent = totalPedidos;
    if (document.getElementById('stat-gastado')) document.getElementById('stat-gastado').textContent = '$' + totalGastado.toFixed(0);
}

// ── TABS ─────────────────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.perfil-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
}

// ── CLASES DE ESTADO ─────────────────────────────────────────
const claseEstado = {
    'Completada': 'estado-entregado',
    'En espera':  'estado-en-camino',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-agotado'
};

// ── RENDERIZAR PEDIDOS ───────────────────────────────────────
function renderizarPedidos(lista) {
    const contenedor = document.getElementById('lista-pedidos');
    const sinResultados = document.getElementById('sin-pedidos');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        sinResultados.classList.remove('hidden');
        return;
    }
    sinResultados.classList.add('hidden');

    lista.forEach(function (p) {
        const itemsHTML = p.items.map(function (item) {
            return `
                <div class="pedido-item">
                    <div class="item-imagen-mini"></div>
                    <div class="item-info-mini">
                        <strong>${item.nombre}</strong>
                        <p>${item.variante} · Cant: ${item.cantidad}</p>
                    </div>
                    <span class="item-precio-mini">$${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
            `;
        }).join('');

        contenedor.innerHTML += `
            <div class="pedido-card">
                <div class="pedido-header">
                    <div>
                        <span class="pedido-numero">${p.id}</span>
                        <span class="pedido-fecha">${p.fecha} · ${p.metodo}</span>
                    </div>
                    <span class="pedido-estado ${claseEstado[p.estado] || ''}">${p.estado}</span>
                </div>
                <div class="pedido-items">
                    ${itemsHTML}
                </div>
                <div class="pedido-footer">
                    <span class="pedido-total">Total: <strong>$${p.total.toFixed(2)}</strong></span>
                    <div class="pedido-acciones">
                        <a href="factura.html?id=${p.id.replace('#CP-','')}">
                            <button class="btn-accion-pedido">Ver Factura</button>
                        </a>
                        ${p.estado === 'Completada' ? '<button class="btn-accion-pedido">Volver a comprar</button>' : ''}
                        ${p.estado === 'Pendiente' || p.estado === 'En espera' ? '<button class="btn-accion-pedido" style="color:var(--danger); border-color:var(--danger);">Cancelar</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
}

// ── FILTRAR PEDIDOS ──────────────────────────────────────────
function filtrarPedidos() {
    const busqueda = document.getElementById('buscar-pedido').value.toLowerCase().trim();
    const estado   = document.getElementById('filtro-estado-pedido').value;
    const orden    = document.getElementById('ordenar-pedidos').value;

    let lista = pedidos.filter(function (p) {
        const coincideTexto  = p.id.toLowerCase().includes(busqueda) ||
            p.items.some(function (i) { return i.nombre.toLowerCase().includes(busqueda); });
        const coincideEstado = estado === '' || p.estado === estado;
        return coincideTexto && coincideEstado;
    });

    lista.sort(function (a, b) {
        if (orden === 'mayor')   return b.total - a.total;
        if (orden === 'menor')   return a.total - b.total;
        if (orden === 'antiguo') return a.id.localeCompare(b.id);
        return b.id.localeCompare(a.id);
    });

    renderizarPedidos(lista);
}

// ── CERRAR SESIÓN ────────────────────────────────────────────
function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ── EVENTOS ──────────────────────────────────────────────────
function inicializarEventos() {
    document.getElementById('buscar-pedido').addEventListener('input', filtrarPedidos);
    document.getElementById('filtro-estado-pedido').addEventListener('change', filtrarPedidos);
    document.getElementById('ordenar-pedidos').addEventListener('change', filtrarPedidos);

    const btnLogout = document.querySelector('a[href="index.html"] .btn-login');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
}

// ── INICIALIZAR ──────────────────────────────────────────────
verificarSesion();
cargarEncabezado();
inicializarEventos();
cargarPedidos();