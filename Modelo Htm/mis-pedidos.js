// ── DATOS SIMULADOS ──────────────────────────────────────────
const usuario = {
    nombre:   'Carlos',
    apellido: 'Méndez',
    iniciales: 'CM'
};

const pedidos = [
    {
        id: '#VT-1024', fecha: '09/05/2024', estado: 'Completada',
        metodo: 'Tarjeta de crédito', total: 1299.99,
        items: [
            { nombre: 'Samsung Galaxy S24 Ultra', variante: 'Negro Titanio, 256GB', cantidad: 1, precio: 1299.99 }
        ]
    },
    {
        id: '#VT-1023', fecha: '08/05/2024', estado: 'En espera',
        metodo: 'PSE', total: 499.98,
        items: [
            { nombre: 'AirPods Pro 2nd Gen', variante: 'Blanco', cantidad: 2, precio: 249.99 }
        ]
    },
    {
        id: '#VT-1020', fecha: '02/05/2024', estado: 'Completada',
        metodo: 'Efectivo', total: 159.98,
        items: [
            { nombre: 'Logitech MX Master 3S', variante: 'Grafito',       cantidad: 1, precio: 99.99 },
            { nombre: 'Cable USB-C 2m',         variante: 'Negro',         cantidad: 4, precio: 14.99 }
        ]
    },
    {
        id: '#VT-1015', fecha: '25/04/2024', estado: 'Cancelada',
        metodo: 'Paypal', total: 1099.00,
        items: [
            { nombre: 'iPad Pro 12.9" M2', variante: 'Gris Espacial, 256GB', cantidad: 1, precio: 1099.00 }
        ]
    },
    {
        id: '#VT-1010', fecha: '18/04/2024', estado: 'Completada',
        metodo: 'Tarjeta de débito', total: 59.99,
        items: [
            { nombre: 'Kit Arduino Starter Pro', variante: 'Kit completo', cantidad: 1, precio: 59.99 }
        ]
    },
];

const favoritos = [
    { nombre: 'MacBook Pro 14" M3',    precio: '$1,999.00', categoria: 'Laptops'    },
    { nombre: 'Logitech MX Master 3S', precio: '$99.99',    categoria: 'Accesorios' },
    { nombre: 'Kit Arduino Pro',        precio: '$59.99',    categoria: 'Robótica'   },
    { nombre: 'iPad Pro 12.9" M2',      precio: '$1,099.00', categoria: 'Tablets'    },
];

const direcciones = [
    { tipo: 'Principal', nombre: 'Carlos Méndez', direccion: 'Calle 80 #45-12', ciudad: 'Bogotá', postal: '110111', telefono: '310 555 0001', principal: true  },
    { tipo: 'Trabajo',   nombre: 'Carlos Méndez', direccion: 'Av. El Dorado #92-50', ciudad: 'Bogotá', postal: '110221', telefono: '310 555 0002', principal: false },
];


// ── INICIALIZAR HEADER ───────────────────────────────────────
document.getElementById('nombre-usuario').textContent = usuario.nombre;
document.getElementById('perfil-nombre').textContent  = usuario.nombre + ' ' + usuario.apellido;
document.getElementById('avatar-iniciales').textContent = usuario.iniciales;


// ── STATS DEL SIDEBAR ────────────────────────────────────────
function calcularStats() {
    const totalPedidos  = pedidos.length;
    const totalGastado  = pedidos
        .filter(function (p) { return p.estado === 'Completada'; })
        .reduce(function (s, p) { return s + p.total; }, 0);
    const totalResenas  = 3; // Simulado

    document.getElementById('stat-pedidos').textContent = totalPedidos;
    document.getElementById('stat-gastado').textContent = '$' + totalGastado.toFixed(0);
    document.getElementById('stat-resenas').textContent = totalResenas;
}
calcularStats();


// ── CAMBIAR TAB ──────────────────────────────────────────────
function cambiarTab(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.perfil-tab').forEach(function (t) {
        t.classList.add('hidden');
        t.classList.remove('active');
    });
    // Desactivar todos los nav items
    document.querySelectorAll('.perfil-nav-item').forEach(function (b) {
        b.classList.remove('active');
    });

    // Mostrar el tab seleccionado
    document.getElementById('tab-' + tab).classList.remove('hidden');
    document.getElementById('tab-' + tab).classList.add('active');

    // Activar el botón correspondiente
    const botones = document.querySelectorAll('.perfil-nav-item');
    const tabIndex = { pedidos: 0, favoritos: 1, direcciones: 2, cuenta: 3 };
    if (tabIndex[tab] !== undefined) {
        botones[tabIndex[tab]].classList.add('active');
    }
}


// ── CLASES DE ESTADO ─────────────────────────────────────────
const claseEstado = {
    'Completada': 'estado-entregado',
    'En espera':  'estado-en-camino',
    'Pendiente':  'estado-pendiente',
    'Cancelada':  'estado-agotado'
};


// ── RENDERIZAR PEDIDOS ───────────────────────────────────────
function renderizarPedidos(lista) {
    const contenedor = document.getElementById('lista-pedidos');
    const sinResultados = document.getElementById('sin-pedidos');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        sinResultados.classList.remove('hidden');
        return;
    }
    sinResultados.classList.add('hidden');

    lista.forEach(function (p) {
        const itemsHTML = p.items.map(function (item) {
            return `
                <div class="pedido-item">
                    <div class="item-imagen-mini"></div>
                    <div class="item-info-mini">
                        <strong>${item.nombre}</strong>
                        <p>${item.variante} · Cant: ${item.cantidad}</p>
                    </div>
                    <span class="item-precio-mini">$${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
            `;
        }).join('');

        contenedor.innerHTML += `
            <div class="pedido-card">
                <div class="pedido-header">
                    <div>
                        <span class="pedido-numero">${p.id}</span>
                        <span class="pedido-fecha">${p.fecha} · ${p.metodo}</span>
                    </div>
                    <span class="pedido-estado ${claseEstado[p.estado] || ''}">${p.estado}</span>
                </div>
                <div class="pedido-items">
                    ${itemsHTML}
                </div>
                <div class="pedido-footer">
                    <span class="pedido-total">Total: <strong>$${p.total.toFixed(2)}</strong></span>
                    <div class="pedido-acciones">
                        <a href="factura.html?id=${p.id}">
                            <button class="btn-accion-pedido">Ver Factura</button>
                        </a>
                        ${p.estado === 'Completada' ? '<button class="btn-accion-pedido">Volver a comprar</button>' : ''}
                        ${p.estado === 'Pendiente' || p.estado === 'En espera' ? '<button class="btn-accion-pedido" style="color:var(--danger); border-color:var(--danger);">Cancelar</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
}


// ── FILTRAR PEDIDOS ──────────────────────────────────────────
function filtrarPedidos() {
    const busqueda = document.getElementById('buscar-pedido').value.toLowerCase().trim();
    const estado   = document.getElementById('filtro-estado-pedido').value;
    const orden    = document.getElementById('ordenar-pedidos').value;

    let lista = pedidos.filter(function (p) {
        const coincideTexto  = p.id.toLowerCase().includes(busqueda) ||
            p.items.some(function (i) { return i.nombre.toLowerCase().includes(busqueda); });
        const coincideEstado = estado === '' || p.estado === estado;
        return coincideTexto && coincideEstado;
    });

    lista.sort(function (a, b) {
        if (orden === 'mayor')   return b.total - a.total;
        if (orden === 'menor')   return a.total - b.total;
        if (orden === 'antiguo') return a.id.localeCompare(b.id);
        return b.id.localeCompare(a.id); // reciente por defecto
    });

    renderizarPedidos(lista);
}

document.getElementById('buscar-pedido').addEventListener('input',           filtrarPedidos);
document.getElementById('filtro-estado-pedido').addEventListener('change',   filtrarPedidos);
document.getElementById('ordenar-pedidos').addEventListener('change',        filtrarPedidos);


// ── RENDERIZAR FAVORITOS ─────────────────────────────────────
function renderizarFavoritos() {
    const contenedor = document.getElementById('lista-favoritos');
    favoritos.forEach(function (f) {
        contenedor.innerHTML += `
            <div class="producto-card-mini">
                <div class="producto-imagen-mini"></div>
                <p class="producto-nombre-mini">${f.nombre}</p>
                <p class="producto-precio-mini">${f.precio}</p>
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <a href="catalogo.html" style="flex:1;">
                        <button class="btn-agregar-mini">Ver producto</button>
                    </a>
                    <button class="btn-quitar-fav" style="flex:1;" onclick="this.closest('.producto-card-mini').remove()">❤️</button>
                </div>
            </div>
        `;
    });
}
renderizarFavoritos();


// ── RENDERIZAR DIRECCIONES ───────────────────────────────────
function renderizarDirecciones() {
    const contenedor = document.getElementById('lista-direcciones');
    direcciones.forEach(function (d) {
        contenedor.innerHTML += `
            <div class="direccion-card ${d.principal ? 'direccion-principal' : ''}">
                <div class="direccion-header">
                    <strong>${d.tipo}</strong>
                    ${d.principal ? '<span class="badge-principal">Principal</span>' : ''}
                    <div class="direccion-acciones">
                        <button class="btn-accion-dir">Editar</button>
                        ${!d.principal ? '<button class="btn-accion-dir" style="color:var(--danger);">Eliminar</button>' : ''}
                    </div>
                </div>
                <p>${d.nombre}</p>
                <p>${d.direccion}</p>
                <p>${d.ciudad} · ${d.postal}</p>
                <p>${d.telefono}</p>
            </div>
        `;
    });

    // Tarjeta de agregar dirección
    contenedor.innerHTML += `
        <div class="direccion-card direccion-agregar">
            <div class="direccion-agregar-contenido">
                <span>+</span>
                <p>Agregar dirección</p>
            </div>
        </div>
    `;
}
renderizarDirecciones();


// ── GUARDAR DATOS DE CUENTA ──────────────────────────────────
document.getElementById('btn-guardar-cuenta').addEventListener('click', function () {
    const msg = document.getElementById('msg-cuenta');
    msg.style.color = 'var(--success)';
    msg.textContent = '✓ Datos actualizados correctamente.';
    setTimeout(function () { msg.textContent = ''; }, 3000);
});


// ── CAMBIAR CONTRASEÑA ───────────────────────────────────────
document.getElementById('btn-cambiar-pass').addEventListener('click', function () {
    const actual     = document.getElementById('pass-actual').value;
    const nueva      = document.getElementById('pass-nueva').value;
    const confirmar  = document.getElementById('pass-confirmar').value;
    const msg        = document.getElementById('msg-pass');

    if (!actual || !nueva || !confirmar) {
        msg.style.color = 'var(--danger)';
        msg.textContent = 'Completa todos los campos.';
        return;
    }
    if (nueva !== confirmar) {
        msg.style.color = 'var(--danger)';
        msg.textContent = 'Las contraseñas no coinciden.';
        return;
    }
    if (nueva.length < 8) {
        msg.style.color = 'var(--danger)';
        msg.textContent = 'La contraseña debe tener al menos 8 caracteres.';
        return;
    }

    msg.style.color = 'var(--success)';
    msg.textContent = '✓ Contraseña actualizada correctamente.';
    document.getElementById('pass-actual').value    = '';
    document.getElementById('pass-nueva').value     = '';
    document.getElementById('pass-confirmar').value = '';
    setTimeout(function () { msg.textContent = ''; }, 3000);
});


// ── CERRAR SESIÓN ────────────────────────────────────────────
function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'index.html';
}

document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function (e) {
    e.preventDefault();
    cerrarSesion();
});


// ── INICIALIZAR ──────────────────────────────────────────────
filtrarPedidos();