const URL_API = "http://localhost:3000/api";
const SEPARADOR_VARIANTE = " | Variante: ";

let productos = [];
let categorias = [];
let idEditando = null;
let idEliminando = null;

// ── HELPERS PARA DESCRIPCIÓN + VARIANTE COMBINADAS ────────────
function combinarDescripcion(descripcion, variante) {
    const desc = descripcion || '—';
    return variante ? `${desc}${SEPARADOR_VARIANTE}${variante}` : desc;
}

function separarDescripcion(descripcionCompleta) {
    if (!descripcionCompleta) return { descripcion: '', variante: '' };
    const partes = descripcionCompleta.split(SEPARADOR_VARIANTE);
    return {
        descripcion: partes[0] || '',
        variante: partes[1] || ''
    };
}

// ── HELPERS DE ESTADO ─────────────────────────────────────────
function getEstado(stock) {
    if (stock === 0)  return 'Agotado';
    if (stock < 5)    return 'Stock bajo';
    return 'Activo';
}

function getBadgeEstado(estado) {
    if (estado === 'Agotado')    return 'stock-out';
    if (estado === 'Stock bajo') return 'stock-low';
    return 'stock-ok';
}

// ── CARGAR DATOS DESDE LA BASE DE DATOS ───────────────────────
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${URL_API}/productos`);
        if (!respuesta.ok) throw new Error("Error al obtener productos");
        productos = await respuesta.json();
        actualizarStats();
        aplicarFiltros();
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch(`${URL_API}/categorias`);
        if (!respuesta.ok) throw new Error("Error al obtener categorías");
        categorias = await respuesta.json();

        // Select del modal (valor = id_categoria)
        const selectModal = document.getElementById('campo-categoria');
        selectModal.innerHTML = '<option value="">Selecciona una categoría</option>' +
            categorias.map(c => `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');

        // Select del filtro (valor = nombre, para comparar contra p.categoria)
        const selectFiltro = document.getElementById('filtro-categoria');
        selectFiltro.innerHTML = '<option value="">Todas las categorías</option>' +
            categorias.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// ── ACTUALIZAR ESTADÍSTICAS ──────────────────────────────────
function actualizarStats() {
    const total     = productos.length;
    const agotados  = productos.filter(p => p.stock === 0).length;
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 5).length;
    const activos   = total - agotados - stockBajo;

    document.getElementById('stat-total').textContent      = total;
    document.getElementById('stat-activos').textContent    = activos;
    document.getElementById('stat-agotados').textContent   = agotados;
    document.getElementById('stat-stock-bajo').textContent = stockBajo;
}

// ── RENDERIZAR TABLA ─────────────────────────────────────────
function renderizarTabla(lista) {
    const tbody = document.getElementById('tabla-productos');
    tbody.innerHTML = '';

    document.getElementById('conteo-resultados').textContent =
        lista.length + ' producto' + (lista.length !== 1 ? 's' : '');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    No se encontraron productos con esos filtros.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(function (p) {
        const estado = getEstado(p.stock);
        const badge  = getBadgeEstado(estado);
        const { variante } = separarDescripcion(p.descripcion);

        tbody.innerHTML += `
            <tr>
                <td>
                    <strong style="color:var(--text-primary);">${p.nombre}</strong>
                    <br>
                    <span style="font-size:0.78rem; color:var(--text-muted);">${variante}</span>
                </td>
                <td>${p.categoria}</td>
                <td style="color:var(--accent-light); font-weight:700;">$${Number(p.precio).toFixed(2)}</td>
                <td>${p.stock} uds.</td>
                <td><span class="badge ${badge}">${estado}</span></td>
                <td>${p.ventas} vendidos</td>
                <td>
                    <button class="btn-accion btn-editar-t" onclick="abrirEditar(${p.id})">Editar</button>
                    <button class="btn-accion btn-eliminar-t" onclick="abrirEliminar(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// ── FILTRAR Y ORDENAR ────────────────────────────────────────
function aplicarFiltros() {
    const busqueda  = document.getElementById('input-busqueda').value.toLowerCase().trim();
    const categoria = document.getElementById('filtro-categoria').value;
    const estadoFil = document.getElementById('filtro-estado').value;
    const orden     = document.getElementById('filtro-orden').value;

    let lista = productos.filter(function (p) {
        const coincideNombre    = p.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === '' || p.categoria === categoria;
        const estadoProducto    = getEstado(p.stock);
        const coincideEstado    = estadoFil === '' || estadoProducto === estadoFil;
        return coincideNombre && coincideCategoria && coincideEstado;
    });

    lista.sort(function (a, b) {
        if (orden === 'precio-asc')  return a.precio - b.precio;
        if (orden === 'precio-desc') return b.precio - a.precio;
        if (orden === 'stock-asc')   return a.stock - b.stock;
        return a.nombre.localeCompare(b.nombre);
    });

    renderizarTabla(lista);
}

// ── MODAL AGREGAR / EDITAR ───────────────────────────────────
function abrirModal(id) {
    idEditando = id || null;
    limpiarErrores();

    if (idEditando !== null) {
        const p = productos.find(function (x) { return x.id === idEditando; });
        const { descripcion, variante } = separarDescripcion(p.descripcion);

        document.getElementById('modal-titulo').textContent      = 'Editar Producto';
        document.getElementById('campo-nombre').value            = p.nombre;
        document.getElementById('campo-categoria').value         = p.id_categoria;
        document.getElementById('campo-precio').value             = p.precio;
        document.getElementById('campo-stock').value             = p.stock;
        document.getElementById('campo-variante').value          = variante;
        document.getElementById('campo-descripcion').value       = descripcion;
    } else {
        document.getElementById('modal-titulo').textContent = 'Agregar Producto';
        document.getElementById('campo-nombre').value       = '';
        document.getElementById('campo-categoria').value    = '';
        document.getElementById('campo-precio').value       = '';
        document.getElementById('campo-stock').value        = '';
        document.getElementById('campo-variante').value     = '';
        document.getElementById('campo-descripcion').value  = '';
    }

    document.getElementById('modal-producto').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-producto').classList.add('hidden');
    idEditando = null;
}

function limpiarErrores() {
    ['err-nombre', 'err-categoria', 'err-precio', 'err-stock'].forEach(function (id) {
        document.getElementById(id).textContent = '';
    });
}

function abrirEditar(id) { abrirModal(id); }

// ── GUARDAR PRODUCTO ─────────────────────────────────────────
document.getElementById('btn-guardar-producto').addEventListener('click', async function () {
    limpiarErrores();

    const nombre       = document.getElementById('campo-nombre').value.trim();
    const id_categoria = document.getElementById('campo-categoria').value;
    const precio        = parseFloat(document.getElementById('campo-precio').value);
    const stock         = parseInt(document.getElementById('campo-stock').value);
    const variante      = document.getElementById('campo-variante').value.trim();
    const descripcion   = document.getElementById('campo-descripcion').value.trim();

    let hayError = false;
    if (!nombre) {
        document.getElementById('err-nombre').textContent = 'El nombre es obligatorio.';
        hayError = true;
    }
    if (!id_categoria) {
        document.getElementById('err-categoria').textContent = 'Selecciona una categoría.';
        hayError = true;
    }
    if (isNaN(precio) || precio < 0) {
        document.getElementById('err-precio').textContent = 'Ingresa un precio válido.';
        hayError = true;
    }
    if (isNaN(stock) || stock < 0) {
        document.getElementById('err-stock').textContent = 'Ingresa un stock válido.';
        hayError = true;
    }
    if (hayError) return;

    const descripcionCompleta = combinarDescripcion(descripcion, variante);

    try {
        let respuesta;
        if (idEditando !== null) {
            respuesta = await fetch(`${URL_API}/productos/${idEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, id_categoria, precio, stock, descripcion: descripcionCompleta })
            });
        } else {
            respuesta = await fetch(`${URL_API}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, id_categoria, precio, stock, descripcion: descripcionCompleta })
            });
        }

        if (!respuesta.ok) throw new Error("Error al guardar el producto");

        cerrarModal();
        await cargarProductos();
    } catch (error) {
        console.error("Error guardando producto:", error);
        alert("No se pudo guardar el producto.");
    }
});

// ── MODAL ELIMINAR ───────────────────────────────────────────
function abrirEliminar(id) {
    idEliminando = id;
    const p = productos.find(function (x) { return x.id === id; });
    document.getElementById('nombre-a-eliminar').textContent = p.nombre;
    document.getElementById('modal-eliminar').classList.remove('hidden');
}

function cerrarEliminar() {
    document.getElementById('modal-eliminar').classList.add('hidden');
    idEliminando = null;
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async function () {
    try {
        const respuesta = await fetch(`${URL_API}/productos/${idEliminando}`, { method: 'DELETE' });
        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error || "No se pudo eliminar el producto.");
            cerrarEliminar();
            return;
        }

        cerrarEliminar();
        await cargarProductos();
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("No se pudo eliminar el producto.");
        cerrarEliminar();
    }
});

// ── EVENTOS DE MODALES ───────────────────────────────────────
document.getElementById('btn-abrir-modal').addEventListener('click',    function () { abrirModal(null); });
document.getElementById('btn-cerrar-modal').addEventListener('click',   cerrarModal);
document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
document.getElementById('btn-cerrar-eliminar').addEventListener('click',   cerrarEliminar);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarEliminar);

document.getElementById('modal-producto').addEventListener('click', function (e) {
    if (e.target === this) cerrarModal();
});
document.getElementById('modal-eliminar').addEventListener('click', function (e) {
    if (e.target === this) cerrarEliminar();
});

// ── EVENTOS DE FILTROS ───────────────────────────────────────
document.getElementById('input-busqueda').addEventListener('input',   aplicarFiltros);
document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-estado').addEventListener('change',    aplicarFiltros);
document.getElementById('filtro-orden').addEventListener('change',     aplicarFiltros);

// ── CERRAR SESIÓN ────────────────────────────────────────────
document.querySelector('a[href="index.html"] .btn-login').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

// ── INICIALIZAR ──────────────────────────────────────────────
cargarCategorias().then(cargarProductos);