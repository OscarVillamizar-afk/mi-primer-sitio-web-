// ── DATOS SIMULADOS ──────────────────────────────────────────
// En producción esto vendría de la URL (?id=#VT-1024) y la BD
const todasLasFacturas = {
    '#VT-1024': {
        factura_id:    '#FAC-1024',
        pedido_id:     '#VT-1024',
        fecha_compra:  '09/05/2024',
        metodo_pago:   'Tarjeta de crédito',
        estado:        'Completada',
        vendedor:      'TechStore Pro',
        descuento:     0,
        comprador: {
            nombre:  'Carlos Méndez',
            correo:  'carlos.mendez@email.com',
            dir:     'Calle 80 #45-12, Bogotá',
            postal:  'CP: 110111'
        },
        items: [
            { nombre: 'Samsung Galaxy S24 Ultra', variante: 'Negro Titanio, 256GB', cantidad: 1, precio: 1299.99 }
        ]
    },
    '#VT-1023': {
        factura_id:    '#FAC-1023',
        pedido_id:     '#VT-1023',
        fecha_compra:  '08/05/2024',
        metodo_pago:   'PSE',
        estado:        'En espera',
        vendedor:      'TechStore Pro',
        descuento:     0,
        comprador: {
            nombre:  'Carlos Méndez',
            correo:  'carlos.mendez@email.com',
            dir:     'Calle 80 #45-12, Bogotá',
            postal:  'CP: 110111'
        },
        items: [
            { nombre: 'AirPods Pro 2nd Gen', variante: 'Blanco', cantidad: 2, precio: 249.99 }
        ]
    },
    '#VT-1020': {
        factura_id:    '#FAC-1020',
        pedido_id:     '#VT-1020',
        fecha_compra:  '02/05/2024',
        metodo_pago:   'Efectivo',
        estado:        'Completada',
        vendedor:      'TechStore Pro',
        descuento:     10,
        comprador: {
            nombre:  'Carlos Méndez',
            correo:  'carlos.mendez@email.com',
            dir:     'Calle 80 #45-12, Bogotá',
            postal:  'CP: 110111'
        },
        items: [
            { nombre: 'Logitech MX Master 3S', variante: 'Grafito', cantidad: 1, precio: 99.99 },
            { nombre: 'Cable USB-C 2m',         variante: 'Negro',   cantidad: 4, precio: 14.99 }
        ]
    },
    '#VT-1015': {
        factura_id:    '#FAC-1015',
        pedido_id:     '#VT-1015',
        fecha_compra:  '25/04/2024',
        metodo_pago:   'Paypal',
        estado:        'Cancelada',
        vendedor:      'TechStore Pro',
        descuento:     0,
        comprador: {
            nombre:  'Carlos Méndez',
            correo:  'carlos.mendez@email.com',
            dir:     'Calle 80 #45-12, Bogotá',
            postal:  'CP: 110111'
        },
        items: [
            { nombre: 'iPad Pro 12.9" M2', variante: 'Gris Espacial, 256GB', cantidad: 1, precio: 1099.00 }
        ]
    },
    '#VT-1010': {
        factura_id:    '#FAC-1010',
        pedido_id:     '#VT-1010',
        fecha_compra:  '18/04/2024',
        metodo_pago:   'Tarjeta de débito',
        estado:        'Completada',
        vendedor:      'TechStore Pro',
        descuento:     0,
        comprador: {
            nombre:  'Carlos Méndez',
            correo:  'carlos.mendez@email.com',
            dir:     'Calle 80 #45-12, Bogotá',
            postal:  'CP: 110111'
        },
        items: [
            { nombre: 'Kit Arduino Starter Pro', variante: 'Kit completo', cantidad: 1, precio: 59.99 }
        ]
    }
};

// Clases de estado para los badges
const claseEstado = {
    'Completada': 'estado-entregado',
    'En espera':  'estado-en-camino',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-agotado'
};

// ── LEER ID DE LA URL ────────────────────────────────────────
// Toma el parámetro ?id=... de la URL para cargar la factura correcta
function getIdDesdUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '#VT-1024'; // Por defecto muestra la primera
}

function inicializarFactura() {
    const idActual = getIdDesdUrl();
    const factura  = todasLasFacturas[idActual] || todasLasFacturas['#VT-1024'];

    // ── POBLAR ENCABEZADO ────────────────────────────────────────
    const fechaHoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('breadcrumb-id').textContent       = factura.factura_id;
    document.getElementById('fac-id').textContent              = factura.factura_id;
    document.getElementById('fac-fecha-emision').textContent   = factura.fecha_compra;
    document.getElementById('fac-pedido-id').textContent       = factura.pedido_id;
    document.getElementById('fac-generado').textContent        = fechaHoy;

    document.getElementById('fac-comprador-nombre').textContent = factura.comprador.nombre;
    document.getElementById('fac-comprador-correo').textContent = factura.comprador.correo;
    document.getElementById('fac-comprador-dir').textContent    = factura.comprador.dir;
    document.getElementById('fac-comprador-postal').textContent = factura.comprador.postal;

    document.getElementById('fac-vendedor-nombre').textContent  = factura.vendedor;
    document.getElementById('fac-metodo-pago').textContent      = 'Método de pago: ' + factura.metodo_pago;

    const estadoEl = document.getElementById('fac-estado');
    estadoEl.textContent  = factura.estado;
    estadoEl.className    = 'pedido-estado ' + (claseEstado[factura.estado] || '');

    // ── POBLAR TABLA DE ITEMS ────────────────────────────────────
    const tbody = document.getElementById('fac-tabla-items');
    let subtotal = 0;

    factura.items.forEach(function (item) {
        const lineaTotal = item.precio * item.cantidad;
        subtotal += lineaTotal;

        tbody.innerHTML += `
            <tr class="factura-item-row">
                <td class="factura-item-name">${item.nombre}</td>
                <td class="factura-item-variante">${item.variante}</td>
                <td class="factura-item-cantidad">${item.cantidad}</td>
                <td class="factura-item-precio">$${item.precio.toFixed(2)}</td>
                <td class="factura-item-subtotal">$${lineaTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    // ── CALCULAR TOTALES ─────────────────────────────────────────
    const IVA        = 0.19;
    const impuestos  = subtotal * IVA;
    const descuento  = factura.descuento;
    const total      = subtotal + impuestos - descuento;

    document.getElementById('fac-subtotal').textContent  = '$' + subtotal.toFixed(2);
    document.getElementById('fac-impuestos').textContent = '$' + impuestos.toFixed(2);
    document.getElementById('fac-descuento').textContent = '-$' + descuento.toFixed(2);
    document.getElementById('fac-total').textContent     = '$' + total.toFixed(2);

    // ── OTROS PEDIDOS (acceso rápido) ────────────────────────────
    const otrosPedidosEl = document.getElementById('otros-pedidos');
    Object.values(todasLasFacturas).forEach(function (f) {
        if (f.pedido_id === idActual) return; // Omitir el actual

        const totalOtro = f.items.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);

        otrosPedidosEl.innerHTML += `
            <div class="factura-pedido-row">
                <div>
                    <span class="factura-pedido-id">${f.factura_id}</span>
                    <span class="factura-pedido-meta">${f.fecha_compra}</span>
                </div>
                <div class="factura-pedido-actions">
                    <span class="pedido-estado ${claseEstado[f.estado] || ''}">${f.estado}</span>
                    <span class="factura-pedido-total">$${(totalOtro * 1.19).toFixed(2)}</span>
                    <a href="factura.html?id=${f.pedido_id}">
                        <button class="btn-accion-pedido">Ver factura</button>
                    </a>
                </div>
            </div>
        `;
    });
}

// ── IMPRIMIR ─────────────────────────────────────────────────
function inicializarImprimir() {
    document.getElementById('btn-imprimir').addEventListener('click', function () {
        window.print();
    });
}

// ── DESCARGAR PDF (simulado) ─────────────────────────────────
function inicializarDescargar() {
    document.getElementById('btn-descargar').addEventListener('click', function () {
        const idActual = getIdDesdUrl();
        const factura = todasLasFacturas[idActual] || todasLasFacturas['#VT-1024'];
        alert('En producción esto generaría un PDF con la factura ' + factura.factura_id + '.\nIntegra una librería como jsPDF para esta funcionalidad.');
    });
}

// ── VERIFICACIÓN DE SESIÓN ───────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'usuario') {
        // Si no está logueado o no es usuario, redirigir a login
        window.location.href = 'login.html';
    }
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
inicializarFactura();
inicializarImprimir();
inicializarDescargar();
inicializarCerrarSesion();
verificarSesion();
