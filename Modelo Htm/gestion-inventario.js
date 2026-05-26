// ── DATOS SIMULADOS ──────────────────────────────────────────
// (Espeja Inventario + Detalle_inventario + Producto de la BD)
let productos = [
    { id: 1, nombre: 'Samsung Galaxy S24 Ultra', categoria: 'smartphones', precio: 1299.99, stock: 18, actualizado: '09/05/2026' },
    { id: 2, nombre: 'AirPods Pro 2nd Gen',      categoria: 'audio',       precio: 249.99,  stock: 4,  actualizado: '08/05/2026' },
    { id: 3, nombre: 'Logitech MX Master 3S',    categoria: 'accesorios',  precio: 99.99,   stock: 22, actualizado: '07/05/2026' },
    { id: 4, nombre: 'iPad Pro 12.9" M2',        categoria: 'tablets',     precio: 1099.00, stock: 2,  actualizado: '06/05/2026' },
    { id: 5, nombre: 'Kit Arduino Starter Pro',  categoria: 'robotica',    precio: 59.99,   stock: 0,  actualizado: '05/05/2026' },
    { id: 6, nombre: 'MacBook Pro 14" M3',       categoria: 'laptops',     precio: 1999.00, stock: 7,  actualizado: '04/05/2026' },
    { id: 7, nombre: 'Sony WH-1000XM5',          categoria: 'audio',       precio: 349.99,  stock: 5,  actualizado: '03/05/2026' },
];

let historial = [
    { tipo: 'entrada', texto: '<strong>+10 unidades</strong> añadidas a Samsung Galaxy S24 Ultra',    tiempo: 'Hace 2h' },
    { tipo: 'salida',  texto: '<strong>-3 unidades</strong> vendidas de AirPods Pro 2nd Gen',         tiempo: 'Hace 4h' },
    { tipo: 'ajuste',  texto: '<strong>Ajuste</strong>: iPad Pro actualizado a 2 unidades',            tiempo: 'Hace 1 día' },
    { tipo: 'agotado', texto: '<strong>Sin stock</strong>: Kit Arduino Starter Pro agotado',           tiempo: 'Hace 2 días' },
    { tipo: 'entrada', texto: '<strong>+15 unidades</strong> añadidas a Logitech MX Master 3S',       tiempo: 'Hace 3 días' },
];

let productosFiltrados = [...productos];
let stockProductoActual = null;
const STOCK_MAX_REF = 30; // Referencia para la barra visual

// ── ESTADO STOCK ─────────────────────────────────────────────
function estadoStock(stock) {
    if (stock === 0) return 'agotado';
    if (stock <= 5)  return 'bajo';
    return 'ok';
}

function labelEstado(stock) {
    const e = estadoStock(stock);
    if (e === 'agotado') return '<span class="stock-agotado">Agotado</span>';
    if (e === 'bajo')    return '<span class="stock-bajo">Stock bajo</span>';
    return '<span class="stock-ok">En stock</span>';
}

function colorBarra(stock) {
    const e = estadoStock(stock);
    if (e === 'agotado') return 'var(--danger)';
    if (e === 'bajo')    return 'var(--warning)';
    return 'var(--success)';
}

const catLabel = { smartphones:'Smartphones', laptops:'Laptops', audio:'Audio', accesorios:'Accesorios', tablets:'Tablets', robotica:'Robótica' };

// ── ALERTAS ──────────────────────────────────────────────────
function renderizarAlertas() {
    const cont = document.getElementById('gi-alertas');
    cont.innerHTML = '';
    productos.forEach(function(p) {
        const e = estadoStock(p.stock);
        if (e === 'agotado') {
            cont.innerHTML += `<div class="gi-alerta gi-alerta-agotado"><span class="gi-alerta-icono"></span><strong>${p.nombre}</strong>&nbsp;está agotado. Requiere reabastecimiento urgente.</div>`;
        } else if (e === 'bajo') {
            cont.innerHTML += `<div class="gi-alerta gi-alerta-bajo"><span class="gi-alerta-icono"></span><strong>${p.nombre}</strong>&nbsp;tiene stock bajo (${p.stock} unidades restantes).</div>`;
        }
    });
}

// ── STATS ────────────────────────────────────────────────────
function actualizarStats() {
    const total    = productos.length;
    const enStock  = productos.filter(p => estadoStock(p.stock) === 'ok').length;
    const bajo     = productos.filter(p => estadoStock(p.stock) === 'bajo').length;
    const agotados = productos.filter(p => estadoStock(p.stock) === 'agotado').length;
    document.getElementById('si-total-prod').textContent = total;
    document.getElementById('si-en-stock').textContent   = enStock;
    document.getElementById('si-stock-bajo').textContent  = bajo;
    document.getElementById('si-agotados').textContent    = agotados;
}

// ── RENDERIZAR TABLA ─────────────────────────────────────────
function renderizarTabla() {
    const tbody = document.getElementById('gi-tabla-body');
    tbody.innerHTML = '';

    if (productosFiltrados.length === 0) {
        document.getElementById('gi-sin-resultados').style.display = 'block';
        return;
    }
    document.getElementById('gi-sin-resultados').style.display = 'none';

    productosFiltrados.forEach(function(p) {
        const pct   = Math.min(100, Math.round((p.stock / STOCK_MAX_REF) * 100));
        const color = colorBarra(p.stock);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td><strong class="gi-producto-nombre">${p.nombre}</strong></td>
            <td>${catLabel[p.categoria] || p.categoria}</td>
            <td><strong>$${p.precio.toFixed(2)}</strong></td>
            <td>
                <div class="gi-stock-wrap">
                    <span class="gi-stock-num" style="--stock-color: ${color};">${p.stock}</span>
                    <div class="gi-barra-wrap">
                        <div class="gi-barra" style="--barra-width: ${pct}%; --barra-color: ${color};"></div>
                    </div>
                </div>
            </td>
            <td>${labelEstado(p.stock)}</td>
            <td class="gi-actualizado">${p.actualizado}</td>
            <td>
                <button class="btn-accion btn-editar-stock" onclick="abrirModalStock(${p.id})">Editar stock</button>
                <button class="btn-accion btn-eliminar-prod" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ── HISTORIAL ────────────────────────────────────────────────
function renderizarHistorial() {
    const lista = document.getElementById('gi-historial-lista');
    lista.innerHTML = '';
    document.getElementById('gi-total-movs').textContent = historial.length + ' registros';
    const iconos = { entrada: '↑', salida: '↓', ajuste: '⟳', agotado: '!' };
    historial.forEach(function(h) {
        lista.innerHTML += `
            <li class="gi-historial-item">
                <div class="gi-hist-icono hist-${h.tipo === 'agotado' ? 'salida' : h.tipo}">${iconos[h.tipo] || '·'}</div>
                <p class="gi-hist-texto">${h.texto}</p>
                <span class="gi-hist-tiempo">${h.tiempo}</span>
            </li>
        `;
    });
}

// ── FILTRAR ──────────────────────────────────────────────────
function filtrar() {
    const texto = document.getElementById('gi-input-busqueda').value.toLowerCase().trim();
    const cat   = document.getElementById('gi-filtro-cat').value;
    const est   = document.getElementById('gi-filtro-stock').value;

    productosFiltrados = productos.filter(function(p) {
        const textoM = !texto || p.nombre.toLowerCase().includes(texto);
        const catM   = !cat   || p.categoria === cat;
        const estM   = !est   || estadoStock(p.stock) === (est === 'ok' ? 'ok' : est === 'bajo' ? 'bajo' : 'agotado');
        return textoM && catM && estM;
    });
    renderizarTabla();
}

// ── ELIMINAR ─────────────────────────────────────────────────
function eliminarProducto(id) {
    const p = productos.find(x => x.id === id);
    if (confirm(`¿Eliminar "${p.nombre}" del inventario?`)) {
        productos = productos.filter(x => x.id !== id);
        historial.unshift({ tipo: 'salida', texto: `<strong>Eliminado</strong>: ${p.nombre} del inventario`, tiempo: 'Ahora' });
        actualizarStats();
        renderizarAlertas();
        filtrar();
        renderizarHistorial();
    }
}

// ── MODAL STOCK ──────────────────────────────────────────────
function abrirModalStock(id) {
    stockProductoActual = id;
    const p = productos.find(x => x.id === id);
    document.getElementById('modal-stock-titulo').textContent = 'Actualizar Stock — ' + p.nombre;
    document.getElementById('gi-prod-preview').innerHTML = `
        <p class="gi-prod-preview-nombre">${p.nombre}</p>
        <p class="gi-prod-preview-info">
            <span>Categoría: ${catLabel[p.categoria]}</span>
            <span>Stock actual: <strong class="gi-stock-total" style="--stock-total-color: ${colorBarra(p.stock)};">${p.stock} unidades</strong></span>
        </p>
    `;
    document.getElementById('ms-cantidad').value = '';
    document.getElementById('ms-obs').value = '';
    document.getElementById('ms-tipo').value = 'entrada';
    document.getElementById('err-ms-cantidad').textContent = '';
    document.getElementById('modal-stock').style.display = 'flex';
}

function inicializarModalStock() {
    document.getElementById('btn-guardar-stock').addEventListener('click', function() {
        const cant = parseInt(document.getElementById('ms-cantidad').value);
        const tipo = document.getElementById('ms-tipo').value;
        const obs  = document.getElementById('ms-obs').value.trim();

        if (!cant || cant <= 0) {
            document.getElementById('err-ms-cantidad').textContent = 'Ingresa una cantidad válida.';
            return;
        }
        document.getElementById('err-ms-cantidad').textContent = '';

        const p = productos.find(x => x.id === stockProductoActual);
        let stockAnterior = p.stock;

        if (tipo === 'entrada')  p.stock += cant;
        if (tipo === 'salida')   p.stock = Math.max(0, p.stock - cant);
        if (tipo === 'ajuste')   p.stock = cant;

        const hoy = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
        p.actualizado = hoy;

        const tipoTexto = { entrada: `+${cant} unidades añadidas`, salida: `-${cant} unidades retiradas`, ajuste: `Ajuste: ${stockAnterior} → ${p.stock} unidades` };
        historial.unshift({
            tipo: tipo,
            texto: `<strong>${tipoTexto[tipo]}</strong> en ${p.nombre}${obs ? ' — ' + obs : ''}`,
            tiempo: 'Ahora'
        });

        actualizarStats();
        renderizarAlertas();
        filtrar();
        renderizarHistorial();
        document.getElementById('modal-stock').style.display = 'none';
        stockProductoActual = null;
    });
}

// ── MODAL NUEVO PRODUCTO ─────────────────────────────────────
function inicializarModalProducto() {
    document.getElementById('btn-abrir-modal-prod').addEventListener('click', function() {
        ['np-nombre','np-desc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('np-cat').value    = '';
        document.getElementById('np-precio').value = '';
        document.getElementById('np-stock').value  = '';
        ['err-np-nombre','err-np-cat','err-np-precio','err-np-stock'].forEach(id => {
            document.getElementById(id).textContent = '';
        });
        document.getElementById('modal-producto').style.display = 'flex';
    });

    document.getElementById('btn-guardar-prod').addEventListener('click', function() {
        let ok = true;
        const nombre = document.getElementById('np-nombre').value.trim();
        const cat    = document.getElementById('np-cat').value;
        const precio = parseFloat(document.getElementById('np-precio').value);
        const stock  = parseInt(document.getElementById('np-stock').value);
        const desc   = document.getElementById('np-desc').value.trim();

        if (!nombre)         { document.getElementById('err-np-nombre').textContent = 'Campo requerido.'; ok = false; }
        if (!cat)            { document.getElementById('err-np-cat').textContent    = 'Selecciona categoría.'; ok = false; }
        if (!precio || precio < 0) { document.getElementById('err-np-precio').textContent = 'Precio inválido.'; ok = false; }
        if (isNaN(stock) || stock < 0) { document.getElementById('err-np-stock').textContent = 'Stock inválido.'; ok = false; }

        if (!ok) return;

        const nuevoId = Math.max(...productos.map(p => p.id)) + 1;
        const hoy = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
        productos.push({ id: nuevoId, nombre, categoria: cat, precio, stock, actualizado: hoy, descripcion: desc });
        historial.unshift({ tipo: 'entrada', texto: `<strong>Nuevo producto</strong> creado: ${nombre} con ${stock} unidades`, tiempo: 'Ahora' });

        actualizarStats();
        renderizarAlertas();
        filtrar();
        renderizarHistorial();
        document.getElementById('modal-producto').style.display = 'none';
    });
}

// ── CERRAR MODALES ───────────────────────────────────────────
function inicializarCerrarModales() {
    ['btn-cerrar-stock','btn-cancelar-stock'].forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            document.getElementById('modal-stock').style.display = 'none';
        });
    });
    ['btn-cerrar-prod','btn-cancelar-prod'].forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            document.getElementById('modal-producto').style.display = 'none';
        });
    });
    document.getElementById('modal-stock').addEventListener('click', function(e) { if (e.target===this) this.style.display='none'; });
    document.getElementById('modal-producto').addEventListener('click', function(e) { if (e.target===this) this.style.display='none'; });
}

// ── ACTUALIZAR TODO ──────────────────────────────────────────
function inicializarActualizarTodo() {
    document.getElementById('btn-actualizar-todo').addEventListener('click', function() {
        this.textContent = '↻ Actualizando...';
        setTimeout(() => { this.textContent = '↻ Actualizar todo'; }, 1000);
    });
}

// ── FILTROS EN TIEMPO REAL ───────────────────────────────────
function inicializarFiltros() {
    document.getElementById('gi-input-busqueda').addEventListener('input', filtrar);
    document.getElementById('gi-filtro-cat').addEventListener('change', filtrar);
    document.getElementById('gi-filtro-stock').addEventListener('change', filtrar);
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
function inicializarGestionInventario() {
    actualizarStats();
    renderizarAlertas();
    filtrar();
    renderizarHistorial();
    inicializarModalStock();
    inicializarModalProducto();
    inicializarCerrarModales();
    inicializarActualizarTodo();
    inicializarFiltros();
    inicializarCerrarSesion();
    verificarSesion();
}

// Ejecutar inicialización
inicializarGestionInventario();
