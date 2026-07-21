// ── CONFIGURACIÓN DE LA API ──────────────────────────────────
const API_BASE_URL = 'http://localhost:8080/api'; // Ajusta la URL base de tu servidor/backend

let productos = [];
let historial = [];
let productosFiltrados = [];
let stockProductoActual = null;
const STOCK_MAX_REF = 30; // Referencia visual para las barras

// ── AUXILIARES DE CABECERA Y PETICIONES HTTP ─────────────────
function obtenerHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    };
}

async function cargarProductos() {
    try {
        const res = await fetch(`${API_BASE_URL}/productos`, { headers: obtenerHeaders() });
        if (!res.ok) throw new Error('Error al obtener la lista de productos.');
        productos = await res.json();
        
        filtrar();
        actualizarStats();
        renderizarAlertas();
    } catch (error) {
        console.error('Error en cargarProductos:', error);
    }
}

async function cargarHistorial() {
    try {
        const res = await fetch(`${API_BASE_URL}/historial`, { headers: obtenerHeaders() });
        if (!res.ok) throw new Error('Error al obtener el historial de movimientos.');
        historial = await res.json();
        
        renderizarHistorial();
    } catch (error) {
        console.error('Error en cargarHistorial:', error);
    }
}

// ── ESTADO Y FORMATO DE STOCK ────────────────────────────────
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

const catLabel = { 
    smartphones: 'Smartphones', 
    laptops: 'Laptops', 
    audio: 'Audio', 
    accesorios: 'Accesorios', 
    tablets: 'Tablets', 
    robotica: 'Robótica' 
};

// ── ALERTAS Y MÉTRICAS ───────────────────────────────────────
function renderizarAlertas() {
    const cont = document.getElementById('gi-alertas');
    if (!cont) return;
    cont.innerHTML = '';
    productos.forEach(p => {
        const e = estadoStock(p.stock);
        if (e === 'agotado') {
            cont.innerHTML += `<div class="gi-alerta gi-alerta-agotado"><span class="gi-alerta-icono"></span><strong>${p.nombre}</strong>&nbsp;está agotado. Requiere reabastecimiento urgente.</div>`;
        } else if (e === 'bajo') {
            cont.innerHTML += `<div class="gi-alerta gi-alerta-bajo"><span class="gi-alerta-icono"></span><strong>${p.nombre}</strong>&nbsp;tiene stock bajo (${p.stock} unidades restantes).</div>`;
        }
    });
}

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

// ── RENDERIZAR TABLA E HISTORIAL ─────────────────────────────
function renderizarTabla() {
    const tbody = document.getElementById('gi-tabla-body');
    const sinRes = document.getElementById('gi-sin-resultados');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (productosFiltrados.length === 0) {
        if (sinRes) sinRes.style.display = 'block';
        return;
    }
    if (sinRes) sinRes.style.display = 'none';

    productosFiltrados.forEach(p => {
        const pct   = Math.min(100, Math.round((p.stock / STOCK_MAX_REF) * 100));
        const color = colorBarra(p.stock);
        const tr    = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td><strong class="gi-producto-nombre">${p.nombre}</strong></td>
            <td>${catLabel[p.categoria] || p.categoria}</td>
            <td><strong>$${Number(p.precio).toFixed(2)}</strong></td>
            <td>
                <div class="gi-stock-wrap">
                    <span class="gi-stock-num" style="--stock-color: ${color};">${p.stock}</span>
                    <div class="gi-barra-wrap">
                        <div class="gi-barra" style="--barra-width: ${pct}%; --barra-color: ${color};"></div>
                    </div>
                </div>
            </td>
            <td>${labelEstado(p.stock)}</td>
            <td class="gi-actualizado">${p.actualizado || 'Reciente'}</td>
            <td>
                <button class="btn-accion btn-editar-stock" onclick="abrirModalStock(${p.id})">Editar stock</button>
                <button class="btn-accion btn-eliminar-prod" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarHistorial() {
    const lista = document.getElementById('gi-historial-lista');
    if (!lista) return;

    lista.innerHTML = '';
    document.getElementById('gi-total-movs').textContent = `${historial.length} registros`;
    const iconos = { entrada: '↑', salida: '↓', ajuste: '⟳', agotado: '!' };

    historial.forEach(h => {
        lista.innerHTML += `
            <li class="gi-historial-item">
                <div class="gi-hist-icono hist-${h.tipo === 'agotado' ? 'salida' : h.tipo}">${iconos[h.tipo] || '·'}</div>
                <p class="gi-hist-texto">${h.texto}</p>
                <span class="gi-hist-tiempo">${h.tiempo}</span>
            </li>
        `;
    });
}

// ── FILTROS Y ELIMINACIÓN ────────────────────────────────────
function filtrar() {
    const texto = document.getElementById('gi-input-busqueda').value.toLowerCase().trim();
    const cat   = document.getElementById('gi-filtro-cat').value;
    const est   = document.getElementById('gi-filtro-stock').value;

    productosFiltrados = productos.filter(p => {
        const textoM = !texto || p.nombre.toLowerCase().includes(texto);
        const catM   = !cat   || p.categoria === cat;
        const estM   = !est   || estadoStock(p.stock) === (est === 'ok' ? 'ok' : est === 'bajo' ? 'bajo' : 'agotado');
        return textoM && catM && estM;
    });
    renderizarTabla();
}

async function eliminarProducto(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    if (confirm(`¿Eliminar "${p.nombre}" del inventario?`)) {
        try {
            const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: obtenerHeaders()
            });

            if (!res.ok) throw new Error('No se pudo eliminar el producto en la base de datos.');

            await cargarProductos();
            await cargarHistorial();
        } catch (error) {
            alert(error.message);
        }
    }
}

// ── MODAL ACTUALIZAR STOCK ───────────────────────────────────
function abrirModalStock(id) {
    stockProductoActual = id;
    const p = productos.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modal-stock-titulo').textContent = `Actualizar Stock — ${p.nombre}`;
    document.getElementById('gi-prod-preview').innerHTML = `
        <p class="gi-prod-preview-nombre">${p.nombre}</p>
        <p class="gi-prod-preview-info">
            <span>Categoría: ${catLabel[p.categoria] || p.categoria}</span>
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
    document.getElementById('btn-guardar-stock').addEventListener('click', async function() {
        const cant = parseInt(document.getElementById('ms-cantidad').value);
        const tipo = document.getElementById('ms-tipo').value;
        const obs  = document.getElementById('ms-obs').value.trim();

        if (isNaN(cant) || cant <= 0) {
            document.getElementById('err-ms-cantidad').textContent = 'Ingresa una cantidad válida.';
            return;
        }
        document.getElementById('err-ms-cantidad').textContent = '';

        try {
            const res = await fetch(`${API_BASE_URL}/productos/${stockProductoActual}/stock`, {
                method: 'PATCH',
                headers: obtenerHeaders(),
                body: JSON.stringify({ cantidad: cant, tipo, observacion: obs })
            });

            if (!res.ok) throw new Error('Error al actualizar el stock en el servidor.');

            await cargarProductos();
            await cargarHistorial();

            document.getElementById('modal-stock').style.display = 'none';
            stockProductoActual = null;
        } catch (error) {
            alert(error.message);
        }
    });
}

// ── MODAL NUEVO PRODUCTO ─────────────────────────────────────
function inicializarModalProducto() {
    document.getElementById('btn-abrir-modal-prod').addEventListener('click', function() {
        ['np-nombre', 'np-desc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('np-cat').value    = '';
        document.getElementById('np-precio').value = '';
        document.getElementById('np-stock').value  = '';
        ['err-np-nombre', 'err-np-cat', 'err-np-precio', 'err-np-stock'].forEach(id => {
            document.getElementById(id).textContent = '';
        });
        document.getElementById('modal-producto').style.display = 'flex';
    });

    document.getElementById('btn-guardar-prod').addEventListener('click', async function() {
        let ok = true;
        const nombre = document.getElementById('np-nombre').value.trim();
        const cat    = document.getElementById('np-cat').value;
        const precio = parseFloat(document.getElementById('np-precio').value);
        const stock  = parseInt(document.getElementById('np-stock').value);
        const desc   = document.getElementById('np-desc').value.trim();

        if (!nombre)                     { document.getElementById('err-np-nombre').textContent = 'Campo requerido.'; ok = false; }
        if (!cat)                        { document.getElementById('err-np-cat').textContent    = 'Selecciona categoría.'; ok = false; }
        if (isNaN(precio) || precio < 0) { document.getElementById('err-np-precio').textContent = 'Precio inválido.'; ok = false; }
        if (isNaN(stock) || stock < 0)   { document.getElementById('err-np-stock').textContent  = 'Stock inválido.'; ok = false; }

        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE_URL}/productos`, {
                method: 'POST',
                headers: obtenerHeaders(),
                body: JSON.stringify({ nombre, categoria: cat, precio, stock, descripcion: desc })
            });

            if (!res.ok) throw new Error('Error al guardar el nuevo producto.');

            await cargarProductos();
            await cargarHistorial();

            document.getElementById('modal-producto').style.display = 'none';
        } catch (error) {
            alert(error.message);
        }
    });
}

// ── MANEJO DE EVENTOS Y MODALES ──────────────────────────────
function inicializarCerrarModales() {
    ['btn-cerrar-stock', 'btn-cancelar-stock'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => { document.getElementById('modal-stock').style.display = 'none'; });
    });
    ['btn-cerrar-prod', 'btn-cancelar-prod'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => { document.getElementById('modal-producto').style.display = 'none'; });
    });

    document.getElementById('modal-stock').addEventListener('click', function(e) { if (e.target === this) this.style.display = 'none'; });
    document.getElementById('modal-producto').addEventListener('click', function(e) { if (e.target === this) this.style.display = 'none'; });
}

function inicializarActualizarTodo() {
    const btn = document.getElementById('btn-actualizar-todo');
    if (btn) {
        btn.addEventListener('click', async function() {
            this.textContent = '↻ Actualizando...';
            await Promise.all([cargarProductos(), cargarHistorial()]);
            this.textContent = '↻ Actualizar todo';
        });
    }
}

function inicializarFiltros() {
    document.getElementById('gi-input-busqueda').addEventListener('input', filtrar);
    document.getElementById('gi-filtro-cat').addEventListener('change', filtrar);
    document.getElementById('gi-filtro-stock').addEventListener('change', filtrar);
}

// ── AUTENTICACIÓN Y SESIÓN ───────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'dueno') {
        window.location.href = 'login.html';
    }
}

function inicializarCerrarSesion() {
    const btnCerrar = document.querySelector('a[href="index.html"] .btn-login');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

// ── INICIALIZACIÓN PRINCIPAL ────────────────────────────────
async function inicializarGestionInventario() {
    verificarSesion();

    // Peticiones asíncronas iniciales a la BD
    await Promise.all([cargarProductos(), cargarHistorial()]);

    inicializarModalStock();
    inicializarModalProducto();
    inicializarCerrarModales();
    inicializarActualizarTodo();
    inicializarFiltros();
    inicializarCerrarSesion();
}

// Ejecutar script
inicializarGestionInventario();