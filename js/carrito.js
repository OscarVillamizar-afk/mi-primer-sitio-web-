// ── CUPONES VÁLIDOS ──────────────────────────────────────────
// Objeto con los cupones disponibles y su % de descuento
const cuponesValidos = {
    'TECH10': 10,   // 10% de descuento
    'PROMO20': 20,  // 20% de descuento
    'BIENVENIDO': 5 // 5% de descuento
};

let descuentoActivo = 0; // Guarda el % de descuento aplicado actualmente

// ── FUNCIÓN: Actualizar el resumen del pedido ────────────────
// Se llama cada vez que cambia una cantidad o se aplica un cupón
function actualizarResumen() {
    let subtotal = 0;
    let totalArticulos = 0;

    // Recorre CADA producto en el carrito
    document.querySelectorAll('.carrito-item').forEach(function(item) {
        const precioUnitario = parseFloat(item.dataset.precio);
        const cantidad = parseInt(item.querySelector('input[type="number"]').value);
        const precioTotal = precioUnitario * cantidad;

        item.querySelector('.precio-total').textContent = '$' + precioTotal.toFixed(2);
        subtotal += precioTotal;
        totalArticulos += cantidad;
    });

    const montoDescuento = subtotal * (descuentoActivo / 100);
    const total = subtotal - montoDescuento;

    document.getElementById('resumen-cantidad').textContent =
        'Subtotal (' + totalArticulos + ' artículo' + (totalArticulos !== 1 ? 's' : '') + ')';
    document.getElementById('resumen-subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('resumen-descuento').textContent = '-$' + montoDescuento.toFixed(2);
    document.getElementById('resumen-total').textContent = '$' + total.toFixed(2);
}

// ── BOTONES + y − de cantidad ────────────────────────────────
function inicializarControlesCantidad() {
    document.querySelectorAll('.carrito-item').forEach(function(item) {
        const input = item.querySelector('input[type="number"]');
        const btnMenos = item.querySelector('.btn-menos');
        const btnMas = item.querySelector('.btn-mas');

        btnMenos.addEventListener('click', function() {
            const minimo = parseInt(input.min);
            if (parseInt(input.value) > minimo) {
                input.value = parseInt(input.value) - 1;
                actualizarResumen();
            }
        });

        btnMas.addEventListener('click', function() {
            const maximo = parseInt(input.max);
            if (parseInt(input.value) < maximo) {
                input.value = parseInt(input.value) + 1;
                actualizarResumen();
            }
        });

        input.addEventListener('change', function() {
            actualizarResumen();
        });
    });
}

function inicializarBotonesEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (confirm('¿Seguro que deseas eliminar este producto?')) {
                btn.closest('.carrito-item').remove();
                actualizarResumen();
            }
        });
    });
}

function inicializarCupon() {
    document.querySelector('.btn-aplicar-cupon').addEventListener('click', function() {
        const codigo = document.getElementById('input-cupon').value.trim().toUpperCase();
        const msgCupon = document.getElementById('msg-cupon');

        if (cuponesValidos[codigo]) {
            descuentoActivo = cuponesValidos[codigo];
            msgCupon.style.color = 'green';
            msgCupon.textContent = 'Cupón aplicado: ' + descuentoActivo + '% de descuento';
            actualizarResumen();
        } else {
            descuentoActivo = 0;
            msgCupon.style.color = 'red';
            msgCupon.textContent = 'Cupón no válido. Intenta con otro código.';
            actualizarResumen();
        }
    });
}

function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'usuario') {
        window.location.href = 'login.html';
    }
}

function inicializarCerrarSesion() {
    document.querySelector('.btn-login').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// ── INICIALIZAR ──────────────────────────────────────────────
inicializarControlesCantidad();
inicializarBotonesEliminar();
inicializarCupon();
actualizarResumen();
verificarSesion();
inicializarCerrarSesion();
