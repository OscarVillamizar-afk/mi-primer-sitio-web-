const URL_API = "http://localhost:3000/api";

// ── 1. CARGAR TEMAS DESDE EL BACKEND ─────────────────────────
async function cargarTemasForo(categoriaFiltro = '', textoBusqueda = '') {
    const contenedor = document.getElementById('contenedor-temas-foro');
    const sinResultados = document.getElementById('sin-resultados-foro');
    
    if (!contenedor) return;

    try {
        // Construir parámetros URL para búsqueda y filtrado en servidor
        const params = new URLSearchParams();
        if (categoriaFiltro) params.append('categoria', categoriaFiltro);
        if (textoBusqueda) params.append('q', textoBusqueda);

        const respuesta = await fetch(`${URL_API}/foro/publicaciones?${params.toString()}`);
        if (!respuesta.ok) throw new Error("Error al obtener los temas del foro");

        const temas = await respuesta.json();

        contenedor.innerHTML = ''; // Limpiar publicaciones actuales

        if (temas.length === 0) {
            if (sinResultados) sinResultados.style.display = 'block';
            return;
        }

        if (sinResultados) sinResultados.style.display = 'none';

        // Renderizar cada tema recibido de MySQL
        temas.forEach(tema => {
            const fechaFormateada = new Date(tema.fecha_creacion || tema.created_at).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            contenedor.innerHTML += `
                <article class="tema-card" data-titulo="${tema.titulo.toLowerCase()}" data-categoria="${tema.categoria.toLowerCase()}">
                    <div class="tema-header">
                        <span class="tema-categoria badge-${tema.categoria.toLowerCase()}">${tema.categoria}</span>
                        <span class="tema-fecha">${fechaFormateada}</span>
                    </div>
                    <h3 class="tema-titulo">
                        <a href="tema.html?id=${tema.id}">${tema.titulo}</a>
                    </h3>
                    <p class="tema-extracto">${tema.contenido ? tema.contenido.substring(0, 140) + '...' : ''}</p>
                    <div class="tema-footer">
                        <div class="tema-autor">
                            <span class="autor-avatar">${(tema.autor_nombre || 'U').charAt(0).toUpperCase()}</span>
                            <span class="autor-nombre">${tema.autor_nombre || 'Usuario'}</span>
                        </div>
                        <div class="tema-stats">
                            <span>💬 ${tema.num_respuestas || 0} respuestas</span>
                            <span>👁️ ${tema.vistas || 0} vistas</span>
                        </div>
                    </div>
                </article>
            `;
        });

    } catch (error) {
        console.error("Error al cargar publicaciones del foro:", error);
    }
}

// ── 2. FILTRAR TEMAS EN TIEMPO REAL ──────────────────────────
function aplicarFiltros() {
    const inputBusqueda = document.getElementById('busqueda-foro');
    const selectCategoria = document.getElementById('filtro-categoria');

    const texto = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';
    const categoria = selectCategoria ? selectCategoria.value : '';

    cargarTemasForo(categoria, texto);
}

// ── 3. PILLS DE CATEGORÍA ─────────────────────────────────────
function inicializarPillsCategoria() {
    document.querySelectorAll('.categoria-pill').forEach(pill => {
        pill.addEventListener('click', function () {

            // Quitar "active" de todas las pills
            document.querySelectorAll('.categoria-pill').forEach(p => p.classList.remove('active'));

            // Activar la pill seleccionada
            this.classList.add('active');

            // Identificar categoría de las clases extra
            const clases = Array.from(this.classList).filter(
                c => c !== 'categoria-pill' && c !== 'active'
            );
            const categoria = clases.length > 0 ? clases[0] : '';

            // Sincronizar con el select
            const selectCat = document.getElementById('filtro-categoria');
            if (selectCat) selectCat.value = categoria;

            const inputBusqueda = document.getElementById('busqueda-foro');
            const texto = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';

            cargarTemasForo(categoria, texto);
        });
    });
}

// ── 4. BÚSQUEDA Y SELECT ──────────────────────────────────────
function inicializarControlesFiltro() {
    const inputBusqueda = document.getElementById('busqueda-foro');
    if (inputBusqueda) {
        let timeoutDebounce;
        inputBusqueda.addEventListener('input', function () {
            // Debounce para evitar saturar el servidor en cada tecla
            clearTimeout(timeoutDebounce);
            timeoutDebounce = setTimeout(() => {
                aplicarFiltros();
            }, 300);
        });
    }

    const selectCategoria = document.getElementById('filtro-categoria');
    if (selectCategoria) {
        selectCategoria.addEventListener('change', function () {
            const val = this.value;

            // Sincronizar pills
            document.querySelectorAll('.categoria-pill').forEach(pill => {
                pill.classList.remove('active');
                const clases = Array.from(pill.classList).filter(
                    c => c !== 'categoria-pill' && c !== 'active'
                );
                const pillCat = clases.length > 0 ? clases[0] : '';
                if (pillCat === val) pill.classList.add('active');
            });

            if (val === '') {
                const primeraPill = document.querySelector('.categoria-pill:first-child');
                if (primeraPill) primeraPill.classList.add('active');
            }

            aplicarFiltros();
        });
    }
}


// ── INICIALIZACIÓN GENERAL ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    inicializarPillsCategoria();
    inicializarControlesFiltro();
    
    // Cargar todas las publicaciones al iniciar
    cargarTemasForo();
});