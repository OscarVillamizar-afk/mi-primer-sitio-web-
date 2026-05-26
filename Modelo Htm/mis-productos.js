// ── DATOS INICIALES SIMULADOS ────────────────────────────────
let productos = [
    { id: 1, nombre: 'Samsung Galaxy S24 Ultra', categoria: 'Smartphones', precio: 1299.99, stock: 12, variante: 'Negro Titanio, 256GB', descripcion: 'Smartphone premium con S Pen integrado.', ventas: 34 },
    { id: 2, nombre: 'AirPods Pro 2nd Gen',      categoria: 'Audio',        precio: 249.99,  stock: 8,  variante: 'Blanco',               descripcion: 'Auriculares inalámbricos con cancelación de ruido.', ventas: 51 },
    { id: 3, nombre: 'Logitech MX Master 3S',    categoria: 'Accesorios',   precio: 99.99,   stock: 5,  variante: 'Grafito',              descripcion: 'Mouse ergonómico de alta precisión.', ventas: 28 },
    { id: 4, nombre: 'iPad Pro 12.9" M2',        categoria: 'Tablets',      precio: 1099.00, stock: 0,  variante: 'Gris Espacial, 256GB', descripcion: 'Tablet profesional con chip M2.', ventas: 9  },
    { id: 5, nombre: 'Kit Arduino Starter Pro',  categoria: 'Robótica',     precio: 59.99,   stock: 3,  variante: 'Kit completo',          descripcion: 'Kit para aprender electrónica y programación.', ventas: 22 },
    { id: 6, nombre: 'MacBook Pro 14" M3',       categoria: 'Laptops',      precio: 1999.00, stock: 6,  variante: 'Plata, 512GB',         descripcion: 'Laptop profesional con chip M3.', ventas: 15 },
    { id: 7, nombre: 'Cable USB-C 2m',           categoria: 'Accesorios',   precio: 14.99,   stock: 2,  variante: 'Negro',                descripcion: 'Cable de carga rápida USB-C.', ventas: 67 },
];

let idEditando = null;       // null = nuevo, número = editando
let idEliminando = null;     // id del producto a eliminar


// ── HELPERS ──────────────────────────────────────────────────

// Determina el estado según el stock
function getEstado(stock) {
    if (stock === 0)  return 'Agotado';
    if (stock < 5)    return 'Stock bajo';
    return 'Activo';
}

// Clase CSS del badge de estado
function getBadgeEstado(estado) {
    if (estado === 'Agotado')    return 'stock-out';
    if (estado === 'Stock bajo') return 'stock-low';
    return 'stock-ok';
}


// ── ACTUALIZAR ESTADÍSTICAS ──────────────────────────────────
function actualizarStats() {
    const total     = productos.length;
    const agotados  = productos.filter(p => p.stock === 0).length;
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 5).length;
    const activos   = total - agotados - stockBajo;

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-activos').textContent   = activos;
    document.getElementById('stat-agotados').textContent  = agotados;
    document.getElementById('stat-stock-bajo').textContent = stockBajo;
}


// ── RENDERIZAR TABLA ─────────────────────────────────────────
function renderizarTabla(lista) {
    const tbody = document.getElementById('tabla-productos');
    tbody.innerHTML = '';

    document.getElementById('conteo-resultados').textContent =
        lista.length + ' producto' + (lista.length !== 1 ? 's' : '');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    No se encontraron productos con esos filtros.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(function (p) {
        const estado = getEstado(p.stock);
        const badge  = getBadgeEstado(estado);

        tbody.innerHTML += `
            <tr>
                <td>
                    <strong style="color:var(--text-primary);">${p.nombre}</strong>
                    <br>
                    <span style="font-size:0.78rem; color:var(--text-muted);">${p.variante}</span>
                </td>
                <td>${p.categoria}</td>
                <td style="color:var(--accent-light); font-weight:700;">$${p.precio.toFixed(2)}</td>
                <td>${p.stock} uds.</td>
                <td><span class="badge ${badge}">${estado}</span></td>
                <td>${p.ventas} vendidos</td>
                <td>
                    <button class="btn-accion btn-editar-t" onclick="abrirEditar(${p.id})">Editar</button>
                    <button class="btn-accion btn-eliminar-t" onclick="abrirEliminar(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}


// ── FILTRAR Y ORDENAR ────────────────────────────────────────
function aplicarFiltros() {
    const busqueda  = document.getElementById('input-busqueda').value.toLowerCase().trim();
    const categoria = document.getElementById('filtro-categoria').value;
    const estadoFil = document.getElementById('filtro-estado').value;
    const orden     = document.getElementById('filtro-orden').value;

    let lista = productos.filter(function (p) {
        const coincideNombre    = p.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === '' || p.categoria === categoria;
        const estadoProducto    = getEstado(p.stock);
        const coincideEstado    = estadoFil === '' || estadoProducto === estadoFil;
        return coincideNombre && coincideCategoria && coincideEstado;
    });

    // Ordenar
    lista.sort(function (a, b) {
        if (orden === 'precio-asc')  return a.precio - b.precio;
        if (orden === 'precio-desc') return b.precio - a.precio;
        if (orden === 'stock-asc')   return a.stock - b.stock;
        return a.nombre.localeCompare(b.nombre); // nombre A-Z por defecto
    });

    renderizarTabla(lista);
}


// ── MODAL AGREGAR / EDITAR ───────────────────────────────────
function abrirModal(id) {
    idEditando = id || null;
    limpiarErrores();

    if (idEditando !== null) {
        // Modo edición: llenar campos con datos del producto
        const p = productos.find(function (x) { return x.id === idEditando; });
        document.getElementById('modal-titulo').textContent      = 'Editar Producto';
        document.getElementById('campo-nombre').value            = p.nombre;
        document.getElementById('campo-categoria').value         = p.categoria;
        document.getElementById('campo-precio').value            = p.precio;
        document.getElementById('campo-stock').value             = p.stock;
        document.getElementById('campo-variante').value          = p.variante;
        document.getElementById('campo-descripcion').value       = p.descripcion;
    } else {
        // Modo agregar: limpiar campos
        document.getElementById('modal-titulo').textContent = 'Agregar Producto';
        document.getElementById('campo-nombre').value       = '';
        document.getElementById('campo-categoria').value    = '';
        document.getElementById('campo-precio').value       = '';
        document.getElementById('campo-stock').value        = '';
        document.getElementById('campo-variante').value     = '';
        document.getElementById('campo-descripcion').value  = '';
    }

    document.getElementById('modal-producto').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-producto').classList.add('hidden');
    idEditando = null;
}

function limpiarErrores() {
    ['err-nombre', 'err-categoria', 'err-precio', 'err-stock'].forEach(function (id) {
        document.getElementById(id).textContent = '';
    });
}

// Función global para el botón de editar en la tabla
function abrirEditar(id) { abrirModal(id); }


// ── GUARDAR PRODUCTO ─────────────────────────────────────────
document.getElementById('btn-guardar-producto').addEventListener('click', function () {
    limpiarErrores();

    const nombre      = document.getElementById('campo-nombre').value.trim();
    const categoria   = document.getElementById('campo-categoria').value;
    const precio      = parseFloat(document.getElementById('campo-precio').value);
    const stock       = parseInt(document.getElementById('campo-stock').value);
    const variante    = document.getElementById('campo-variante').value.trim();
    const descripcion = document.getElementById('campo-descripcion').value.trim();

    // Validaciones
    let hayError = false;
    if (!nombre) {
        document.getElementById('err-nombre').textContent = 'El nombre es obligatorio.';
        hayError = true;
    }
    if (!categoria) {
        document.getElementById('err-categoria').textContent = 'Selecciona una categoría.';
        hayError = true;
    }
    if (isNaN(precio) || precio < 0) {
        document.getElementById('err-precio').textContent = 'Ingresa un precio válido.';
        hayError = true;
    }
    if (isNaN(stock) || stock < 0) {
        document.getElementById('err-stock').textContent = 'Ingresa un stock válido.';
        hayError = true;
    }
    if (hayError) return;

    if (idEditando !== null) {
        // Actualizar producto existente
        const idx = productos.findIndex(function (p) { return p.id === idEditando; });
        productos[idx].nombre      = nombre;
        productos[idx].categoria   = categoria;
        productos[idx].precio      = precio;
        productos[idx].stock       = stock;
        productos[idx].variante    = variante;
        productos[idx].descripcion = descripcion;
    } else {
        // Agregar nuevo producto
        const nuevoId = productos.length > 0 ? Math.max.apply(null, productos.map(function (p) { return p.id; })) + 1 : 1;
        productos.push({
            id: nuevoId,
            nombre, categoria, precio, stock,
            variante:    variante    || '—',
            descripcion: descripcion || '—',
            ventas: 0
        });
    }

    cerrarModal();
    actualizarStats();
    aplicarFiltros();
});


// ── MODAL ELIMINAR ───────────────────────────────────────────
function abrirEliminar(id) {
    idEliminando = id;
    const p = productos.find(function (x) { return x.id === id; });
    document.getElementById('nombre-a-eliminar').textContent = p.nombre;
    document.getElementById('modal-eliminar').classList.remove('hidden');
}

function cerrarEliminar() {
    document.getElementById('modal-eliminar').classList.add('hidden');
    idEliminando = null;
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', function () {
    productos = productos.filter(function (p) { return p.id !== idEliminando; });
    cerrarEliminar();
    actualizarStats();
    aplicarFiltros();
});


// ── EVENTOS DE MODALES ───────────────────────────────────────
document.getElementById('btn-abrir-modal').addEventListener('click',    function () { abrirModal(null); });
document.getElementById('btn-cerrar-modal').addEventListener('click',   cerrarModal);
document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
document.getElementById('btn-cerrar-eliminar').addEventListener('click',   cerrarEliminar);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarEliminar);

// Cerrar modales al hacer clic fuera del contenido
document.getElementById('modal-producto').addEventListener('click', function (e) {
    if (e.target === this) cerrarModal();
});
document.getElementById('modal-eliminar').addEventListener('click', function (e) {
    if (e.target === this) cerrarEliminar();
});


// ── EVENTOS DE FILTROS ───────────────────────────────────────
document.getElementById('input-busqueda').addEventListener('input',   aplicarFiltros);
document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-estado').addEventListener('change',    aplicarFiltros);
document.getElementById('filtro-orden').addEventListener('change',     aplicarFiltros);


// ── CERRAR SESIÓN ────────────────────────────────────────────
document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});


// ── INICIALIZAR ──────────────────────────────────────────────
actualizarStats();
aplicarFiltros();