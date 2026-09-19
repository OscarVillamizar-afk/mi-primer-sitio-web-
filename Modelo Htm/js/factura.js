const URL_API = "http://localhost:3000/api";

// Clases de estado para los badges CSS
const claseEstado = {
    'Completada': 'estado-entregado',
    'En espera':  'estado-en-camino',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-agotado'
};

// ── 1. VERIFICAR SESIÓN ───────────────────────────────────────
function verificarSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');
    if (!sesionRaw) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        return JSON.parse(sesionRaw);
    } catch (error) {
        localStorage.removeItem('usuario_ttdt');
        window.location.href = 'login.html';
        return null;
    }
}

// ── 2. LEER ID DE LA URL ──────────────────────────────────────
function getIdDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // Retorna null si no existe en la URL
}

// ── 3. CARGAR FACTURA DESDE LA BASE DE DATOS ──────────────────
async function cargarFactura() {
    const sesion = verificarSesion();
    if (!sesion) return;

    const idPedido = getIdDesdeUrl();
    const usuarioId = sesion.id || localStorage.getItem('usuario_id');

    try {
        // Construcción de endpoint: Si hay id de pedido en URL, trae ese específico; si no, la última del usuario
        const endpoint = idPedido 
            ? `${URL_API}/facturas/pedido/${encodeURIComponent(idPedido)}?usuario_id=${encodeURIComponent(usuarioId)}`
            : `${URL_API}/facturas/usuario/${usuarioId}/ultima`;

        const respuesta = await fetch(endpoint);
        if (!respuesta.ok) throw new Error("No se pudo obtener la información de la factura.");

        const factura = await respuesta.json();

        // ── POBLAR ENCABEZADO Y DATOS DE FACTURA ────────────────
        const fechaHoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

        document.getElementById('breadcrumb-id').textContent       = factura.factura_id || `#FAC-${factura.id}`;
        document.getElementById('fac-id').textContent              = factura.factura_id || `#FAC-${factura.id}`;
        document.getElementById('fac-fecha-emision').textContent   = factura.fecha_compra;
        document.getElementById('fac-pedido-id').textContent       = factura.pedido_id;
        document.getElementById('fac-generado').textContent        = fechaHoy;

        // Comprador
        document.getElementById('fac-comprador-nombre').textContent = factura.comprador.nombre;
        document.getElementById('fac-comprador-correo').textContent = factura.comprador.correo;
        document.getElementById('fac-comprador-dir').textContent    = factura.comprador.dir;
        document.getElementById('fac-comprador-postal').textContent = factura.comprador.postal || 'N/A';

        // Vendedor y Método de pago
        document.getElementById('fac-vendedor-nombre').textContent  = factura.vendedor || 'TechStore Pro';
        document.getElementById('fac-metodo-pago').textContent      = 'Método de pago: ' + factura.metodo_pago;

        // Estado del pedido
        const estadoEl = document.getElementById('fac-estado');
        if (estadoEl) {
            estadoEl.textContent = factura.estado;
            estadoEl.className   = 'pedido-estado ' + (claseEstado[factura.estado] || '');
        }

        // ── POBLAR TABLA DE ITEMS ────────────────────────────────
        const tbody = document.getElementById('fac-tabla-items');
        if (tbody) {
            tbody.innerHTML = '';
            let subtotal = 0;

            factura.items.forEach(function (item) {
                const precioNum = parseFloat(item.precio);
                const lineaTotal = precioNum * item.cantidad;
                subtotal += lineaTotal;

                tbody.innerHTML += `
                    <tr class="factura-item-row">
                        <td class="factura-item-name">${item.nombre}</td>
                        <td class="factura-item-variante">${item.variante || 'N/A'}</td>
                        <td class="factura-item-cantidad">${item.cantidad}</td>
                        <td class="factura-item-precio">$${precioNum.toFixed(2)}</td>
                        <td class="factura-item-subtotal">$${lineaTotal.toFixed(2)}</td>
                    </tr>
                `;
            });

            // ── CALCULAR TOTALES ─────────────────────────────────
            const IVA = 0.19;
            const impuestos = subtotal * IVA;
            const descuento = parseFloat(factura.descuento || 0);
            const total = subtotal + impuestos - descuento;

            document.getElementById('fac-subtotal').textContent  = '$' + subtotal.toFixed(2);
            document.getElementById('fac-impuestos').textContent = '$' + impuestos.toFixed(2);
            document.getElementById('fac-descuento').textContent = '-$' + descuento.toFixed(2);
            document.getElementById('fac-total').textContent     = '$' + total.toFixed(2);
        }

        // Cargar historial de facturas rápidas en la barra lateral / inferior
        cargarOtrosPedidos(usuarioId, factura.pedido_id);

    } catch (error) {
        console.error("Error al renderizar la factura:", error);
    }
}

// ── 4. OTROS PEDIDOS DEL USUARIO (ACCESO RÁPIDO) ──────────────
async function cargarOtrosPedidos(usuarioId, pedidoActualId) {
    const otrosPedidosEl = document.getElementById('otros-pedidos');
    if (!otrosPedidosEl) return;

    try {
        const respuesta = await fetch(`${URL_API}/facturas/usuario/${usuarioId}`);
        if (!respuesta.ok) return;

        const listaFacturas = await respuesta.json();
        otrosPedidosEl.innerHTML = '';

        const facturasFiltradas = listaFacturas.filter(f => f.pedido_id !== pedidoActualId);

        if (facturasFiltradas.length === 0) {
            otrosPedidosEl.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">No tienes otras facturas registradas.</p>';
            return;
        }

        facturasFiltradas.forEach(function (f) {
            const totalOtros = parseFloat(f.total || 0);

            otrosPedidosEl.innerHTML += `
                <div class="factura-pedido-row">
                    <div>
                        <span class="factura-pedido-id">${f.factura_id || '#FAC-' + f.id}</span>
                        <span class="factura-pedido-meta">${f.fecha_compra}</span>
                    </div>
                    <div class="factura-pedido-actions">
                        <span class="pedido-estado ${claseEstado[f.estado] || ''}">${f.estado}</span>
                        <span class="factura-pedido-total">$${totalOtros.toFixed(2)}</span>
                        <a href="factura.html?id=${encodeURIComponent(f.pedido_id)}">
                            <button class="btn-accion-pedido">Ver factura</button>
                        </a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al obtener facturas secundarias:", error);
    }
}

// ── 5. IMPRIMIR ───────────────────────────────────────────────
function inicializarImprimir() {
    const btnImprimir = document.getElementById('btn-imprimir');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', function () {
            window.print();
        });
    }
}

// ── 6. DESCARGAR PDF ──────────────────────────────────────────
function inicializarDescargar() {
    const btnDescargar = document.getElementById('btn-descargar');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', function () {
            const facId = document.getElementById('fac-id').textContent || 'factura';
            alert('Generando documento oficial ' + facId + '...\nUsa Ctrl + P para guardar como PDF si la descarga directa no se ejecuta.');
            window.print();
        });
    }
}

// ── 7. CERRAR SESIÓN ──────────────────────────────────────────
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

// ── INICIALIZACIÓN ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    inicializarImprimir();
    inicializarDescargar();
    inicializarCerrarSesion();
    cargarFactura();
});