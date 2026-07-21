const URL_API = "http://localhost:3000/api";

const cuponesValidos = {
    'TECH10': 10,
    'PROMO20': 20,
    'BIENVENIDO': 5
};

let descuentoActivo = 0;

// ── 1. CARGAR CARRITO DESDE LA BASE DE DATOS (MySQL) ──────────
async function cargarCarritoDesdeBD() {
    const usuarioId = localStorage.getItem('usuario_id');
    const contenedorItems = document.querySelector('.carrito-items');

    if (!usuarioId) {
        console.warn("No hay ID de usuario en localStorage");
        return;
    }

    try {
        const respuesta = await fetch(`${URL_API}/carrito/${usuarioId}`);
        if (!respuesta.ok) throw new Error("Error al obtener productos del carrito");

        const productos = await respuesta.json();
        
        // Limpiamos los productos estáticos del HTML antes de renderizar
        const itemsPrevios = contenedorItems.querySelectorAll('.carrito-item');
        itemsPrevios.forEach(item => item.remove());

        // Si el carrito está vacío en la BD
        if (productos.length === 0) {
            const mensajeVacio = document.createElement('p');
            mensajeVacio.textContent = "Tu carrito está vacío.";
            contenedorItems.prepend(mensajeVacio);
            actualizarResumen();
            return;
        }

        // Renderizamos cada producto traído de la BD
        productos.forEach(prod => {
            const itemHTML = document.createElement('div');
            itemHTML.classList.add('carrito-item');
            itemHTML.dataset.precio = prod.precio;
            itemHTML.dataset.idProducto = prod.id_producto;

            itemHTML.innerHTML = `
                <div class="item-imagen"></div>
                <div class="item-info">
                    <span class="item-categoria">${prod.categoria || 'General'}</span>
                    <h3 class="item-nombre">${prod.nombre_producto}</h3>
                    <p class="item-vendedor">Vendido por: <strong>TT&DT Oficial</strong></p>
                    <p class="item-stock">En stock</p>
                </div>
                <div class="item-cantidad">
                    <button class="btn-cantidad btn-menos">−</button>
                    <input type="number" value="${prod.cantidad}" min="1" max="50">
                    <button class="btn-cantidad btn-mas">+</button>
                </div>
                <div class="item-precio">
                    <p class="precio-unitario">$${parseFloat(prod.precio).toFixed(2)} c/u</p>
                    <p class="precio-total">$${(prod.precio * prod.cantidad).toFixed(2)}</p>
                </div>
                <div class="item-acciones">
                    <button class="btn-eliminar">Eliminar</button>
                </div>
            `;
            contenedorItems.prepend(itemHTML);
        });

        // Reasignamos los eventos a los nuevos botones dinámicos
        inicializarControlesCantidad();
        inicializarBotonesEliminar();
        actualizarResumen();

    } catch (error) {
        console.error("Error cargando carrito:", error);
    }
}

// ── 2. ACTUALIZAR CANTIDAD EN LA BASE DE DATOS ────────────────
async function actualizarCantidadBD(idProducto, nuevaCantidad) {
    const usuarioId = localStorage.getItem('usuario_id');
    try {
        await fetch(`${URL_API}/carrito/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioId,
                producto_id: idProducto,
                cantidad: nuevaCantidad
            })
        });
    } catch (error) {
        console.error("Error al actualizar cantidad en el servidor:", error);
    }
}

// ── 3. ELIMINAR PRODUCTO DE LA BASE DE DATOS ─────────────────
async function eliminarProductoBD(idProducto) {
    const usuarioId = localStorage.getItem('usuario_id');
    try {
        await fetch(`${URL_API}/carrito/eliminar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioId,
                producto_id: idProducto
            })
        });
    } catch (error) {
        console.error("Error al eliminar del servidor:", error);
    }
}

// ── 4. RESUMEN Y EVENTOS ──────────────────────────────────────
function actualizarResumen() {
    let subtotal = 0;
    let totalArticulos = 0;

    document.querySelectorAll('.carrito-item').forEach(function(item) {
        const precioUnitario = parseFloat(item.dataset.precio);
        const inputCantidad = item.querySelector('input[type="number"]');
        if (!inputCantidad) return;
        
        const cantidad = parseInt(inputCantidad.value);
        const precioTotal = precioUnitario * cantidad;

        item.querySelector('.precio-total').textContent = '$' + precioTotal.toFixed(2);
        subtotal += precioTotal;
        totalArticulos += cantidad;
    });

    const montoDescuento = subtotal * (descuentoActivo / 100);
    const total = subtotal - montoDescuento;

    const elCantidad = document.getElementById('resumen-cantidad');
    const elSubtotal = document.getElementById('resumen-subtotal');
    const elDescuento = document.getElementById('resumen-descuento');
    const elTotal = document.getElementById('resumen-total');

    if (elCantidad) elCantidad.textContent = 'Subtotal (' + totalArticulos + ' artículo' + (totalArticulos !== 1 ? 's' : '') + ')';
    if (elSubtotal) elSubtotal.textContent = '$' + subtotal.toFixed(2);
    if (elDescuento) elDescuento.textContent = '-$' + montoDescuento.toFixed(2);
    if (elTotal) elTotal.textContent = '$' + total.toFixed(2);
}

function inicializarControlesCantidad() {
    document.querySelectorAll('.carrito-item').forEach(function(item) {
        const input = item.querySelector('input[type="number"]');
        const btnMenos = item.querySelector('.btn-menos');
        const btnMas = item.querySelector('.btn-mas');
        const idProducto = item.dataset.idProducto;

        if (!input || !btnMenos || !btnMas) return;

        btnMenos.onclick = function() {
            if (parseInt(input.value) > parseInt(input.min)) {
                input.value = parseInt(input.value) - 1;
                actualizarResumen();
                if (idProducto) actualizarCantidadBD(idProducto, input.value);
            }
        };

        btnMas.onclick = function() {
            if (parseInt(input.value) < parseInt(input.max)) {
                input.value = parseInt(input.value) + 1;
                actualizarResumen();
                if (idProducto) actualizarCantidadBD(idProducto, input.value);
            }
        };

        input.onchange = function() {
            actualizarResumen();
            if (idProducto) actualizarCantidadBD(idProducto, input.value);
        };
    });
}

function inicializarBotonesEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(function(btn) {
        btn.onclick = function() {
            const item = btn.closest('.carrito-item');
            const idProducto = item.dataset.idProducto;

            if (confirm('¿Seguro que deseas eliminar este producto?')) {
                item.remove();
                actualizarResumen();
                if (idProducto) eliminarProductoBD(idProducto);
            }
        };
    });
}

function inicializarCupon() {
    const btnCupon = document.querySelector('.btn-aplicar-cupon');
    if (!btnCupon) return;

    btnCupon.addEventListener('click', function() {
        const codigo = document.getElementById('input-cupon').value.trim().toUpperCase();
        const msgCupon = document.getElementById('msg-cupon');

        if (cuponesValidos[codigo]) {
            descuentoActivo = cuponesValidos[codigo];
            msgCupon.style.color = 'green';
            msgCupon.textContent = 'Cupón aplicado: ' + descuentoActivo + '% de descuento';
        } else {
            descuentoActivo = 0;
            msgCupon.style.color = 'red';
            msgCupon.textContent = 'Cupón no válido.';
        }
        actualizarResumen();
    });
}

function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    if (!usuarioLogueado) {
        window.location.href = 'login.html';
    }
}

function inicializarCerrarSesion() {
    const btnLogout = document.querySelector('.btn-login');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

// ── INICIALIZACIÓN PRINCIPAL ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarCupon();
    inicializarCerrarSesion();
    cargarCarritoDesdeBD(); // Hace la petición a MySQL
});