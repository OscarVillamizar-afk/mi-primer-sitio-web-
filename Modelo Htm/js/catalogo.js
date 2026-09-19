const URL_API = "http://localhost:3000/api";
let listaProductosGlobal = []; // Guarda los productos devueltos por la BD

// ── 1. OBTENER PRODUCTOS DE LA BASE DE DATOS ─────────────────
async function cargarProductosBD() {
    try {
        const respuesta = await fetch(`${URL_API}/productos`);
        if (!respuesta.ok) throw new Error("Error al obtener catálogo");

        listaProductosGlobal = await respuesta.json();
        renderizarProductos(listaProductosGlobal);
    } catch (error) {
        console.error("Error al cargar catálogo:", error);
    }
}

// ── 2. RENDERIZAR PRODUCTOS EN EL DOM ─────────────────────────
function renderizarProductos(productos) {
    const grid = document.getElementById('productos-grid');
    const sinResultados = document.getElementById('sin-resultados');

    // Limpiamos tarjetas dinámicas previas
    const tarjetasActuales = grid.querySelectorAll('.producto-card');
    tarjetasActuales.forEach(card => card.remove());

    if (productos.length === 0) {
        if (sinResultados) sinResultados.style.display = 'block';
        return;
    }

    if (sinResultados) sinResultados.style.display = 'none';

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('producto-card');
        card.dataset.nombre = prod.nombre;
        card.dataset.categoria = prod.categoria || '';
        card.dataset.precio = prod.precio;
        card.dataset.idProducto = prod.id;

        card.innerHTML = `
            <div class="producto-imagen"></div>
            <div class="producto-info">
                <span class="producto-categoria">${prod.categoria || 'General'}</span>
                <h3 class="producto-nombre">${prod.nombre}</h3>
                <p class="producto-descripcion">${prod.descripcion || ''}</p>
                <p class="producto-precio">$${parseFloat(prod.precio).toFixed(2)}</p>
                <button class="btn-agregar-carrito" onclick="agregarAlCarrito(${prod.id})">
                </button>
            </div>
        `;

        if (sinResultados) {
            grid.insertBefore(card, sinResultados);
        } else {
            grid.appendChild(card);
        }
    });
}

// ── 3. AGREGAR PRODUCTO AL CARRITO (MySQL) ───────────────────
async function agregarAlCarrito(idProducto) {
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

    try {
        const respuesta = await fetch(`${URL_API}/carrito/agregar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                producto_id: idProducto,
                cantidad: 1
            })
        });

        if (respuesta.ok) {
            alert("Producto agregado al carrito con éxito.");
        } else {
            const data = await respuesta.json();
            alert(data.mensaje || "No se pudo agregar el producto.");
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    }
}

// ── 4. FILTRAR Y ORDENAR LOCALMENTE EN MEMORIA ───────────────
function filtrarProductos() {
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase().trim();
    const categoriaSeleccionada = document.getElementById('categoria').value;
    const precioMin = parseFloat(document.getElementById('precio-min').value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max').value) || Infinity;
    const criterioOrden = document.getElementById('ordenar').value;

    let filtrados = listaProductosGlobal.filter(prod => {
        const nombreMatch = prod.nombre.toLowerCase().includes(textoBusqueda);
        const categoriaMatch = categoriaSeleccionada === '' || prod.categoria === categoriaSeleccionada;
        const precio = parseFloat(prod.precio);
        const precioMatch = precio >= precioMin && precio <= precioMax;

        return nombreMatch && categoriaMatch && precioMatch;
    });

    // Ordenamiento
    if (criterioOrden === 'precio-asc') {
        filtrados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
    } else if (criterioOrden === 'precio-desc') {
        filtrados.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
    } else if (criterioOrden === 'nombre') {
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    renderizarProductos(filtrados);
}

// ── 5. EVENTOS E INICIALIZACIÓN ──────────────────────────────
function inicializarEventosCatalogo() {
    const btnFiltrar = document.querySelector('.btn-filtrar');
    const inputBusqueda = document.getElementById('busqueda');
    const selectOrdenar = document.getElementById('ordenar');

    if (btnFiltrar) btnFiltrar.addEventListener('click', filtrarProductos);
    if (inputBusqueda) inputBusqueda.addEventListener('input', filtrarProductos);
    if (selectOrdenar) selectOrdenar.addEventListener('change', filtrarProductos);
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventosCatalogo();
    cargarProductosBD();
});