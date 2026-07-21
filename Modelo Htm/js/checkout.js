const URL_API = "http://localhost:3000/api";

let pasoActual = 1;
let metodoPagoActual = 'tarjeta';
let subtotalReal = 0;

const costosEnvio = {
    'gratis':    { texto: 'Gratis',  valor: 0 },
    'express':   { texto: '$9.99',   valor: 9.99 },
    'mismo-dia': { texto: '$19.99',  valor: 19.99 }
};

// ── 1. OBTENEMOS EL TOTAL REAL DEL CARRITO DESDE MYSQL ───────
async function cargarResumenPedidoBD() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_API}/carrito/${usuarioId}`);
        if (!respuesta.ok) throw new Error("Error al consultar el carrito");

        const productos = await respuesta.json();

        // Calculamos el subtotal de la base de datos
        subtotalReal = productos.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        // Actualizamos los elementos del resumen en el HTML
        const subtotalEl = document.getElementById('subtotal-resumen');
        if (subtotalEl) subtotalEl.textContent = '$' + subtotalReal.toFixed(2);

        actualizarTotalFinal();
    } catch (error) {
        console.error("Error al cargar datos del carrito:", error);
    }
}

function actualizarTotalFinal() {
    const metodoEnvioSelect = document.getElementById('metodo-envio');
    const seleccion = costosEnvio[metodoEnvioSelect ? metodoEnvioSelect.value : 'gratis'];
    
    const costoEl = document.getElementById('costo-envio');
    const totalEl = document.getElementById('total-final');

    if (costoEl) {
        costoEl.textContent = seleccion.texto;
        costoEl.className = seleccion.valor === 0 ? 'envio-gratis' : '';
    }

    const total = subtotalReal + seleccion.valor;
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

// ── NAVEGAR ENTRE PASOS ──────────────────────────────────────
function irPaso(paso) {
    if (paso > pasoActual) {
        if (pasoActual === 1 && !validarPaso1()) return;
        if (pasoActual === 2 && !validarPaso2()) return;
    }

    document.getElementById('step-' + pasoActual).classList.remove('active');
    document.getElementById('step-' + paso).classList.add('active');

    actualizarIndicadores(paso);

    if (paso === 3) mostrarResumenConfirmacion();

    pasoActual = paso;
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function actualizarIndicadores(pasoNuevo) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step-indicator-' + i);
        if (!indicator) continue;
        
        indicator.classList.remove('active', 'completado');

        if (i < pasoNuevo) {
            indicator.classList.add('completado');
            indicator.querySelector('.step-numero').textContent = '✓';
        } else if (i === pasoNuevo) {
            indicator.classList.add('active');
            indicator.querySelector('.step-numero').textContent = i;
        } else {
            indicator.querySelector('.step-numero').textContent = i;
        }
    }
}

// ── VALIDACIONES ─────────────────────────────────────────────
function validarPaso1() {
    let valido = true;
    const campos = [
        { id: 'nombre',        err: 'err-nombre',        msg: 'El nombre es obligatorio.' },
        { id: 'apellido',      err: 'err-apellido',      msg: 'El apellido es obligatorio.' },
        { id: 'email',         err: 'err-email',         msg: 'El correo es obligatorio.' },
        { id: 'telefono',      err: 'err-telefono',      msg: 'El teléfono es obligatorio.' },
        { id: 'direccion',     err: 'err-direccion',     msg: 'La dirección es obligatoria.' },
        { id: 'ciudad',        err: 'err-ciudad',        msg: 'La ciudad es obligatoria.' },
        { id: 'codigo-postal', err: 'err-codigo-postal', msg: 'El código postal es obligatorio.' },
    ];

    campos.forEach(function(campo) {
        const input = document.getElementById(campo.id);
        const error = document.getElementById(campo.err);
        if (input && error) {
            if (!input.value.trim()) {
                error.textContent = campo.msg;
                valido = false;
            } else {
                error.textContent = '';
            }
        }
    });

    const email = document.getElementById('email').value;
    if (email && !email.includes('@')) {
        document.getElementById('err-email').textContent = 'Ingresa un correo válido.';
        valido = false;
    }

    return valido;
}

function validarPaso2() {
    let valido = true;

    if (metodoPagoActual === 'tarjeta') {
        const numero = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
        if (numero.length < 16) {
            document.getElementById('err-tarjeta').textContent = 'Ingresa un número de tarjeta válido (16 dígitos).';
            valido = false;
        } else {
            document.getElementById('err-tarjeta').textContent = '';
        }

        const venc = document.getElementById('vencimiento').value;
        if (!venc.match(/^\d{2}\/\d{2}$/)) {
            document.getElementById('err-vencimiento').textContent = 'Formato MM/AA';
            valido = false;
        } else {
            document.getElementById('err-vencimiento').textContent = '';
        }

        const cvv = document.getElementById('cvv').value;
        if (cvv.length < 3) {
            document.getElementById('err-cvv').textContent = 'CVV inválido.';
            valido = false;
        } else {
            document.getElementById('err-cvv').textContent = '';
        }
    }

    if (metodoPagoActual === 'pse') {
        if (!document.getElementById('banco').value) {
            document.getElementById('err-banco').textContent = 'Selecciona un banco.';
            valido = false;
        } else {
            document.getElementById('err-banco').textContent = '';
        }
        if (!document.getElementById('cedula').value.trim()) {
            document.getElementById('err-cedula').textContent = 'El número de documento es obligatorio.';
            valido = false;
        } else {
            document.getElementById('err-cedula').textContent = '';
        }
    }

    return valido;
}

function mostrarResumenConfirmacion() {
    const nombre      = document.getElementById('nombre').value;
    const apellido    = document.getElementById('apellido').value;
    const direccion   = document.getElementById('direccion').value;
    const ciudad      = document.getElementById('ciudad').value;
    const metodoEnvio = document.getElementById('metodo-envio');
    const textoEnvio  = metodoEnvio.options[metodoEnvio.selectedIndex].text;

    document.getElementById('resumen-envio-texto').textContent =
        nombre + ' ' + apellido + ' · ' + direccion + ', ' + ciudad + ' · ' + textoEnvio;

    const textosPago = {
        tarjeta:  'Tarjeta terminada en ' + document.getElementById('numero-tarjeta').value.slice(-4),
        pse:      'PSE · ' + (document.getElementById('banco').value || 'Banco seleccionado'),
        efectivo: 'Efectivo (Efecty / Baloto / Bancolombia)'
    };
    document.getElementById('resumen-pago-texto').textContent = textosPago[metodoPagoActual];
}

// ── 2. GUARDAR EL PEDIDO EN LA BASE DE DATOS ─────────────────
async function confirmarPedido() {
    const usuarioId = localStorage.getItem('usuario_id');
    const metodoEnvioVal = document.getElementById('metodo-envio').value;
    const costoEnvio = costosEnvio[metodoEnvioVal].valor;
    const totalPedido = subtotalReal + costoEnvio;

    const datosOrden = {
        usuario_id: usuarioId,
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
        metodo_pago: metodoPagoActual,
        costo_envio: costoEnvio,
        total: totalPedido
    };

    try {
        const respuesta = await fetch(`${URL_API}/ordenes/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosOrden)
        });

        if (!respuesta.ok) throw new Error("No se pudo procesar la orden");

        const data = await respuesta.json();

        // Si la base de datos retorna el ID de la orden generada, la mostramos
        const numeroPedido = data.id_orden ? `#TS-2026-${data.id_orden}` : '#TS-2026-' + Math.floor(Math.random() * 900 + 100);
        document.getElementById('numero-pedido').textContent = numeroPedido;

        document.getElementById('step-3').classList.remove('active');
        document.getElementById('step-exito').classList.add('active');
        document.getElementById('resumen-lateral').style.display = 'none';

        for (let i = 1; i <= 3; i++) {
            const ind = document.getElementById('step-indicator-' + i);
            if (!ind) continue;
            ind.classList.remove('active');
            ind.classList.add('completado');
            ind.querySelector('.step-numero').textContent = '✓';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Error al confirmar pedido:", error);
        alert("Ocurrió un error al procesar la compra en el servidor.");
    }
}

function seleccionarMetodo(metodo) {
    metodoPagoActual = metodo;

    document.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('activo'));
    document.getElementById('btn-' + metodo).classList.add('activo');

    document.getElementById('form-tarjeta').style.display  = metodo === 'tarjeta'  ? 'block' : 'none';
    document.getElementById('form-pse').style.display      = metodo === 'pse'      ? 'block' : 'none';
    document.getElementById('form-efectivo').style.display = metodo === 'efectivo'  ? 'block' : 'none';
}

// ── EVENTOS DE ENTRADA Y MASCARAS ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarResumenPedidoBD();

    const elTarjeta = document.getElementById('numero-tarjeta');
    const elVenc = document.getElementById('vencimiento');
    const elCvv = document.getElementById('cvv');
    const elEnvio = document.getElementById('metodo-envio');

    if (elTarjeta) {
        elTarjeta.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').substring(0, 16);
            this.value = val.match(/.{1,4}/g)?.join(' ') || val;
        });
    }

    if (elVenc) {
        elVenc.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
            this.value = val;
        });
    }

    if (elCvv) {
        elCvv.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    if (elEnvio) {
        elEnvio.addEventListener('change', actualizarTotalFinal);
    }
});