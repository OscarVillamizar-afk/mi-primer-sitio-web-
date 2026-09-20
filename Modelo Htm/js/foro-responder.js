const API_URL = 'https://backend-ttdt.onrender.com';

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function iniciales(nombre) {
    if (!nombre) return 'U';
    return nombre.trim().charAt(0).toUpperCase();
}

// ── VERIFICAR SESIÓN (misma clave que auth-header.js) ──────────────
function verificarSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');

    if (!sesionRaw) {
        alert('Debes iniciar sesión para responder.');
        window.location.href = 'login.html';
        return null;
    }

    try {
        const sesion = JSON.parse(sesionRaw);
        if (!sesion || !sesion.id) {
            alert('Debes iniciar sesión para responder.');
            window.location.href = 'login.html';
            return null;
        }
        return sesion;
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}

// ── CARGAR RESUMEN DE LA PREGUNTA REAL ──────────────────────────────
async function cargarResumenPregunta() {
    const id = obtenerIdDesdeURL();
    const contenedor = document.querySelector('.pregunta-resumen');

    if (!id) {
        if (contenedor) contenedor.innerHTML = '<p style="padding:1.5rem;">No se especificó a qué pregunta estás respondiendo.</p>';
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/foro/publicaciones/${id}`);
        if (!respuesta.ok) throw new Error('No se pudo cargar la pregunta');
        const datos = await respuesta.json();
        const tema = datos.tema;

        if (contenedor) {
            contenedor.innerHTML = `
                <div class="pregunta-resumen-header">
                    <span class="tema-categoria ${tema.categoria}">${tema.categoria}</span>
                    <h2>${tema.titulo}</h2>
                </div>
                <div class="pregunta-resumen-meta">
                    <div class="autor-avatar pequeño">${iniciales(tema.autor_nombre)}</div>
                    <span><strong>${tema.autor_nombre || 'Usuario'}</strong></span>
                </div>
                <div class="pregunta-resumen-texto">
                    <p>${tema.contenido}</p>
                </div>
                <a href="foro-hilo.html?id=${tema.id}" class="link-ver-hilo">Ver hilo completo →</a>
            `;
        }

        const breadcrumb = document.getElementById('breadcrumb-hilo');
        if (breadcrumb) {
            breadcrumb.href = `foro-hilo.html?id=${tema.id}`;
            breadcrumb.textContent = tema.titulo;
        }

        const linkCancelar = document.getElementById('link-cancelar');
        if (linkCancelar) linkCancelar.href = `foro-hilo.html?id=${tema.id}`;

    } catch (error) {
        console.error('Error al cargar la pregunta:', error);
        if (contenedor) contenedor.innerHTML = '<p style="padding:1.5rem;">No se pudo cargar esta pregunta. Puede que ya no exista.</p>';
    }
}

// ── CONTADOR DE CARACTERES ──────────────────────────────────────────
function inicializarContador() {
    const textarea = document.getElementById('respuesta-texto');
    const contador = document.getElementById('resp-count');
    if (textarea && contador) {
        textarea.addEventListener('input', function () {
            contador.textContent = this.value.length;
        });
    }
}

// ── PUBLICAR RESPUESTA ───────────────────────────────────────────────
function inicializarPublicacion() {
    const btnPublicar = document.querySelector('.btn-publicar');
    if (!btnPublicar) return;

    btnPublicar.addEventListener('click', async function () {
        const sesion = verificarSesion();
        if (!sesion) return;

        const textarea = document.getElementById('respuesta-texto');
        const contenido = textarea ? textarea.value.trim() : '';
        const errorEl = document.getElementById('error-respuesta');

        if (contenido.length < 30) {
            if (errorEl) errorEl.textContent = 'Tu respuesta debe tener al menos 30 caracteres.';
            return;
        }
        if (errorEl) errorEl.textContent = '';

        const id = obtenerIdDesdeURL();
        if (!id) {
            alert('No se sabe a qué pregunta estás respondiendo.');
            return;
        }

        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Publicando...';

        try {
            const respuesta = await fetch(`${API_URL}/api/foro/publicaciones/${id}/respuestas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: sesion.id, contenido })
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json().catch(() => ({}));
                throw new Error(errorData.error || 'No se pudo publicar la respuesta.');
            }

            alert('¡Respuesta publicada!');
            window.location.href = `foro-hilo.html?id=${id}`;

        } catch (error) {
            alert(error.message);
            btnPublicar.disabled = false;
            btnPublicar.textContent = 'Publicar respuesta';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarResumenPregunta();
    inicializarContador();
    inicializarPublicacion();
});
