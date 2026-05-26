// ── FUNCIÓN PRINCIPAL: Filtrar temas ─────────────────────────
// Se llama cada vez que el usuario escribe, cambia categoría o hace clic en una pill
function filtrarTemas(categoriaActiva) {

    const textoBusqueda = document.getElementById('busqueda-foro').value.toLowerCase().trim();
    const categoriaSelect = document.getElementById('filtro-categoria').value;

    // Si se pasó una categoría desde una pill, esa tiene prioridad
    // Si no, usa la del select
    const categoriaFiltro = categoriaActiva !== undefined ? categoriaActiva : categoriaSelect;

    const temas = document.querySelectorAll('.tema-card');
    let visibles = 0;

    temas.forEach(function(tema) {
        const titulo    = tema.dataset.titulo;       // texto del título en minúsculas
        const categoria = tema.dataset.categoria;    // ej: "robotica", "hardware"

        const pasaBusqueda  = titulo.includes(textoBusqueda);
        const pasaCategoria = categoriaFiltro === '' || categoria === categoriaFiltro;

        if (pasaBusqueda && pasaCategoria) {
            tema.style.display = '';
            visibles++;
        } else {
            tema.style.display = 'none';
        }
    });

    // Muestra u oculta el mensaje "sin resultados"
    document.getElementById('sin-resultados-foro').style.display =
        visibles === 0 ? 'block' : 'none';
}


// ── PILLS DE CATEGORÍA ───────────────────────────────────────
// Las pills son los botones: Todos, Robótica, Software, Hardware, General
function inicializarPillsCategoria() {
    document.querySelectorAll('.categoria-pill').forEach(function(pill) {

        pill.addEventListener('click', function() {

            // Quita la clase "active" de todas las pills
            document.querySelectorAll('.categoria-pill').forEach(p => p.classList.remove('active'));

            // Se la pone solo a la que se hizo clic
            pill.classList.add('active');

            // Lee la categoría de la pill (el botón "Todos" no tiene clase extra)
            // Buscamos si tiene alguna clase que no sea "categoria-pill" ni "active"
            const clases = Array.from(pill.classList).filter(
                c => c !== 'categoria-pill' && c !== 'active'
            );
            const categoria = clases.length > 0 ? clases[0] : '';

            // También sincroniza el select con la pill seleccionada
            document.getElementById('filtro-categoria').value = categoria;

            filtrarTemas(categoria);
        });
    });
}


// ── BÚSQUEDA EN TIEMPO REAL ──────────────────────────────────
function inicializarBusqueda() {
    document.getElementById('busqueda-foro').addEventListener('input', function() {
        filtrarTemas();
    });
}


// ── SELECT DE CATEGORÍA ──────────────────────────────────────
function inicializarSelectCategoria() {
    document.getElementById('filtro-categoria').addEventListener('change', function() {
        // Sincroniza las pills con el select
        const val = this.value;
        document.querySelectorAll('.categoria-pill').forEach(function(pill) {
            pill.classList.remove('active');
            const clases = Array.from(pill.classList).filter(
                c => c !== 'categoria-pill' && c !== 'active'
            );
            const pillCat = clases.length > 0 ? clases[0] : '';
            if (pillCat === val) pill.classList.add('active');
        });
        // Si el select dice "Todas", activa la pill "Todos"
        if (val === '') {
            document.querySelector('.categoria-pill:first-child').classList.add('active');
        }
        filtrarTemas(val);
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
inicializarPillsCategoria();
inicializarBusqueda();
inicializarSelectCategoria();
