// ── VARIABLES GLOBALES ───────────────────────────────────────
let pasoActual = 1;
let metodoPagoActual = 'tarjeta';

// Costos de envío según selección
const costosEnvio = {
    'gratis':    { texto: 'Gratis',  valor: 0 },
    'express':   { texto: '$9.99',   valor: 9.99 },
    'mismo-dia': { texto: '$19.99',  valor: 19.99 }
};

const subtotal = 1799.97;

// ── NAVEGAR ENTRE PASOS ──────────────────────────────────────
function irPaso(paso) {
    // Valida antes de avanzar
    if (paso > pasoActual) {
        if (pasoActual === 1 && !validarPaso1()) return;
        if (pasoActual === 2 && !validarPaso2()) return;
    }

    // Oculta el paso actual y muestra el nuevo
    document.getElementById('step-' + pasoActual).classList.remove('active');
    document.getElementById('step-' + paso).classList.add('active');

    // Actualiza los indicadores de progreso
    actualizarIndicadores(paso);

    // Si llegamos al paso 3, muestra el resumen
    if (paso === 3) mostrarResumenConfirmacion();

    pasoActual = paso;

    // Scroll suave al inicio del formulario
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// ── INDICADORES DE PASO (los círculos de arriba) ─────────────
function actualizarIndicadores(pasoNuevo) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step-indicator-' + i);
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

// ── VALIDAR PASO 1: ENVÍO ────────────────────────────────────
function validarPaso1() {
    let valido = true;

    // Campos obligatorios del paso 1
    const campos = [
        { id: 'nombre',       err: 'err-nombre',       msg: 'El nombre es obligatorio.' },
        { id: 'apellido',     err: 'err-apellido',     msg: 'El apellido es obligatorio.' },
        { id: 'email',        err: 'err-email',        msg: 'El correo es obligatorio.' },
        { id: 'telefono',     err: 'err-telefono',     msg: 'El teléfono es obligatorio.' },
        { id: 'direccion',    err: 'err-direccion',    msg: 'La dirección es obligatoria.' },
        { id: 'ciudad',       err: 'err-ciudad',       msg: 'La ciudad es obligatoria.' },
        { id: 'codigo-postal',err: 'err-codigo-postal',msg: 'El código postal es obligatorio.' },
    ];

    campos.forEach(function(campo) {
        const input = document.getElementById(campo.id);
        const error = document.getElementById(campo.err);
        if (!input.value.trim()) {
            error.textContent = campo.msg;
            valido = false;
        } else {
            error.textContent = '';
        }
    });

    // Validación extra del email
    const email = document.getElementById('email').value;
    if (email && !email.includes('@')) {
        document.getElementById('err-email').textContent = 'Ingresa un correo válido.';
        valido = false;
    }

    return valido;
}

// ── VALIDAR PASO 2: PAGO ─────────────────────────────────────
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

// ── MOSTRAR RESUMEN EN PASO 3 ────────────────────────────────
function mostrarResumenConfirmacion() {
    // Texto de envío
    const nombre    = document.getElementById('nombre').value;
    const apellido  = document.getElementById('apellido').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad    = document.getElementById('ciudad').value;
    const metodoEnvio = document.getElementById('metodo-envio');
    const textoEnvio  = metodoEnvio.options[metodoEnvio.selectedIndex].text;

    document.getElementById('resumen-envio-texto').textContent =
        nombre + ' ' + apellido + ' · ' + direccion + ', ' + ciudad + ' · ' + textoEnvio;

    // Texto de pago
    const textosPago = {
        tarjeta:  'Tarjeta terminada en ' + document.getElementById('numero-tarjeta').value.slice(-4),
        pse:      'PSE · ' + (document.getElementById('banco').value || 'Banco seleccionado'),
        efectivo: 'Efectivo (Efecty / Baloto / Bancolombia)'
    };
    document.getElementById('resumen-pago-texto').textContent = textosPago[metodoPagoActual];
}

// ── CONFIRMAR PEDIDO ─────────────────────────────────────────
function confirmarPedido() {
    // Genera un número de pedido simulado
    const numeroPedido = '#TS-2024-' + Math.floor(Math.random() * 900 + 100);
    document.getElementById('numero-pedido').textContent = numeroPedido;

    // Oculta el paso 3 y muestra el éxito
    document.getElementById('step-3').classList.remove('active');
    document.getElementById('step-exito').classList.add('active');

    // Oculta el resumen lateral al completar la compra
    document.getElementById('resumen-lateral').style.display = 'none';

    // Marca todos los steps como completados
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById('step-indicator-' + i);
        ind.classList.remove('active');
        ind.classList.add('completado');
        ind.querySelector('.step-numero').textContent = '✓';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── SELECCIÓN DE MÉTODO DE PAGO ──────────────────────────────
function seleccionarMetodo(metodo) {
    metodoPagoActual = metodo;

    // Quita el estilo activo de todos los botones
    document.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('activo'));
    document.getElementById('btn-' + metodo).classList.add('activo');

    // Muestra el formulario del método elegido
    document.getElementById('form-tarjeta').style.display  = metodo === 'tarjeta'  ? 'block' : 'none';
    document.getElementById('form-pse').style.display      = metodo === 'pse'       ? 'block' : 'none';
    document.getElementById('form-efectivo').style.display = metodo === 'efectivo'  ? 'block' : 'none';
}

// ── EVENTOS ──────────────────────────────────────────────────
// Formateo automático de tarjeta
document.getElementById('numero-tarjeta').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '').substring(0, 16);
    this.value = val.match(/.{1,4}/g)?.join(' ') || val;
});

// Formato automático MM/AA en el campo vencimiento
document.getElementById('vencimiento').addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
    this.value = val;
});

// Solo números en el CVV
document.getElementById('cvv').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 4);
});

// Actualizar costo de envío en el resumen
document.getElementById('metodo-envio').addEventListener('change', function() {
    const seleccion = costosEnvio[this.value];
    const costoEl   = document.getElementById('costo-envio');
    const totalEl   = document.getElementById('total-final');

    costoEl.textContent = seleccion.texto;
    costoEl.className   = seleccion.valor === 0 ? 'envio-gratis' : '';

    const total = subtotal + seleccion.valor;
    totalEl.textContent = '$' + total.toFixed(2);
});
