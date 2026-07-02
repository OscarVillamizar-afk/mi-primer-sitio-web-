// ── FUNCIÓN PRINCIPAL: Filtrar y ordenar productos ───────────
function filtrarProductos() {
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase().trim();
    const categoriaSeleccionada = document.getElementById('categoria').value;
    const precioMin = parseFloat(document.getElementById('precio-min').value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max').value) || Infinity;
    const ordenar = document.getElementById('ordenar').value;

    const productos = Array.from(document.querySelectorAll('.producto-card'));
    let visibles = 0;

    productos.forEach(function(card) {
        const nombre = card.dataset.nombre.toLowerCase();
        const categoria = card.dataset.categoria;
        const precio = parseFloat(card.dataset.precio);

        const pasaBusqueda = nombre.includes(textoBusqueda);
        const pasaCategoria = categoriaSeleccionada === '' || categoria === categoriaSeleccionada;
        const pasaPrecio = precio >= precioMin && precio <= precioMax;

        if (pasaBusqueda && pasaCategoria && pasaPrecio) {
            card.style.display = '';
            visibles++;
        } else {
            card.style.display = 'none';
        }
    });

    document.getElementById('sin-resultados').style.display = visibles === 0 ? 'block' : 'none';
    ordenarProductos(ordenar, productos);
}

// ── FUNCIÓN: Ordenar productos ───────────────────────────────
function ordenarProductos(criterio, productos) {
    const grid = document.getElementById('productos-grid');

    productos.sort(function(a, b) {
        if (criterio === 'precio-asc') {
            return parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio);
        }
        if (criterio === 'precio-desc') {
            return parseFloat(b.dataset.precio) - parseFloat(a.dataset.precio);
        }
        if (criterio === 'nombre') {
            return a.dataset.nombre.localeCompare(b.dataset.nombre);
        }
        return 0;
    });

    productos.forEach(function(card) {
        grid.insertBefore(card, document.getElementById('sin-resultados'));
    });
}

// ── EVENTOS ──────────────────────────────────────────────────
function inicializarEventosCatalogo() {
    document.querySelector('.btn-filtrar').addEventListener('click', filtrarProductos);
    document.getElementById('busqueda').addEventListener('input', filtrarProductos);
    document.getElementById('ordenar').addEventListener('change', filtrarProductos);
}

inicializarEventosCatalogo();
