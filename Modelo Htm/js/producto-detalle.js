const URL_API = "http://localhost:3000/api";
let productoActual = null;

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ── CARGAR PRODUCTO REAL DESDE LA BASE DE DATOS ─────────────────────
async function cargarProducto() {
    const id = obtenerIdDesdeURL();
    const contenedor = document.getElementById('producto-detalle-contenedor');

    if (!id) {
        if (contenedor) contenedor.innerHTML = '<p style="padding:2rem;text-align:center;">No se especificó qué producto mostrar.</p>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_API}/productos/${id}`);
        if (!respuesta.ok) throw new Error('No se pudo cargar el producto');

        productoActual = await respuesta.json();
        renderizarProducto(productoActual);

    } catch (error) {
        console.error('Error al cargar el producto:', error);
        if (contenedor) contenedor.innerHTML = '<p style="padding:2rem;text-align:center;">No se pudo cargar este producto. Puede que ya no exista.</p>';
    }
}

function renderizarProducto(prod) {
    document.title = `${prod.nombre} - TT&DT`;

    const breadcrumb = document.getElementById('breadcrumb-producto');
    if (breadcrumb) breadcrumb.textContent = prod.nombre;

    const categoria = document.getElementById('detalle-categoria');
    if (categoria) categoria.textContent = prod.categoria || 'General';

    const nombre = document.getElementById('detalle-nombre');
    if (nombre) nombre.textContent = prod.nombre;

    const precio = document.getElementById('detalle-precio');
    if (precio) precio.textContent = `$${parseFloat(prod.precio).toFixed(2)}`;

    const stock = document.getElementById('detalle-stock');
    if (stock) {
        if (prod.stock > 0) {
            stock.textContent = `En stock (${prod.stock} unidades)`;
            stock.classList.add('en-stock');
        } else {
            stock.textContent = 'Agotado';
            stock.classList.add('agotado');
        }
    }

    const descripcionCorta = document.getElementById('detalle-descripcion');
    if (descripcionCorta) descripcionCorta.textContent = prod.descripcion || '';

    const descripcionLarga = document.getElementById('detalle-descripcion-larga');
    if (descripcionLarga) descripcionLarga.textContent = prod.descripcion || 'Sin descripción disponible.';

    // Límite de cantidad según stock real
    const inputCantidad = document.getElementById('cantidad');
    if (inputCantidad) {
        inputCantidad.max = prod.stock > 0 ? prod.stock : 1;
    }

    // Si no hay stock, deshabilitar los botones de compra
    const btnAgregar = document.getElementById('btn-agregar-carrito-detalle');
    const btnComprar = document.getElementById('btn-comprar-ahora-detalle');
    if (prod.stock <= 0) {
        if (btnAgregar) { btnAgregar.disabled = true; btnAgregar.textContent = 'Agotado'; }
        if (btnComprar) { btnComprar.disabled = true; btnComprar.textContent = 'Agotado'; }
    }
}

// ── CONTROL DE CANTIDAD (+/-) ────────────────────────────────────────
function inicializarControlCantidad() {
    const inputCantidad = document.getElementById('cantidad');
    const btnMas = document.getElementById('btn-mas');
    const btnMenos = document.getElementById('btn-menos');

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const max = parseInt(inputCantidad.max) || 99;
            const actual = parseInt(inputCantidad.value) || 1;
            if (actual < max) inputCantidad.value = actual + 1;
        });
    }

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const actual = parseInt(inputCantidad.value) || 1;
            if (actual > 1) inputCantidad.value = actual - 1;
        });
    }
}

// ── AGREGAR AL CARRITO (misma lógica que catalogo.js) ────────────────
async function agregarAlCarritoDetalle(redirigirAlCarrito) {
    if (!productoActual) return;

    const sesionGuardada = localStorage.getItem('usuario_ttdt');
    if (!sesionGuardada) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = 'login.html';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(sesionGuardada);
    } catch (e) {
        localStorage.removeItem('usuario_ttdt');
        alert("Tu sesión no es válida, inicia sesión de nuevo.");
        window.location.href = 'login.html';
        return;
    }

    const inputCantidad = document.getElementById('cantidad');
    const cantidad = parseInt(inputCantidad ? inputCantidad.value : 1) || 1;

    try {
        const respuesta = await fetch(`${URL_API}/carrito/agregar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                producto_id: productoActual.id,
                cantidad: cantidad
            })
        });

        if (respuesta.ok) {
            if (redirigirAlCarrito) {
                window.location.href = 'carrito.html';
            } else {
                alert("Producto agregado al carrito con éxito.");
            }
        } else {
            const data = await respuesta.json();
            alert(data.mensaje || data.error || "No se pudo agregar el producto.");
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        alert("Hubo un problema al agregar el producto al carrito.");
    }
}

function inicializarBotonesCompra() {
    const btnAgregar = document.getElementById('btn-agregar-carrito-detalle');
    const btnComprar = document.getElementById('btn-comprar-ahora-detalle');

    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => agregarAlCarritoDetalle(false));
    }
    if (btnComprar) {
        btnComprar.addEventListener('click', () => agregarAlCarritoDetalle(true));
    }
}

// ── TABS (se mantiene igual que antes) ───────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('content-' + tab).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProducto();
    inicializarControlCantidad();
    inicializarBotonesCompra();
});