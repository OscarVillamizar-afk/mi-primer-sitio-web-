const API_URL = 'https://backend-ttdt.onrender.com';

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function iniciales(nombre) {
    if (!nombre) return 'U';
    return nombre.trim().charAt(0).toUpperCase();
}

async function cargarHilo() {
    const id = obtenerIdDesdeURL();

    if (!id) {
        const contenedor = document.getElementById('hilo-pregunta-contenedor');
        if (contenedor) {
            contenedor.innerHTML = '<p style="padding:2rem;text-align:center;color:#666;">No se especificó qué pregunta mostrar.</p>';
        }
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/foro/publicaciones/${id}`);
        if (!respuesta.ok) throw new Error('No se pudo cargar la pregunta');

        const datos = await respuesta.json();
        renderizarPregunta(datos.tema);
        renderizarRespuestas(datos.respuestas);

    } catch (error) {
        console.error('Error al cargar el hilo:', error);
        const contenedor = document.getElementById('hilo-pregunta-contenedor');
        if (contenedor) {
            contenedor.innerHTML = '<p style="padding:2rem;text-align:center;color:#666;">No se pudo cargar esta pregunta. Puede que ya no exista.</p>';
        }
    }
}

function renderizarPregunta(tema) {
    document.title = `${tema.titulo} - TT&DT`;

    const breadcrumb = document.getElementById('breadcrumb-titulo');
    if (breadcrumb) breadcrumb.textContent = tema.titulo;

    const contenedor = document.getElementById('hilo-pregunta-contenedor');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="hilo-cabecera">
                <div class="hilo-categoria-wrap">
                    <span class="tema-categoria ${tema.categoria}">${tema.categoria}</span>
                </div>
                <h1>${tema.titulo}</h1>
                <div class="hilo-meta">
                    <div class="autor-info">
                        <div class="autor-avatar grande">${iniciales(tema.autor_nombre)}</div>
                        <div>
                            <strong>${tema.autor_nombre || 'Usuario'}</strong>
                        </div>
                    </div>
                    <div class="hilo-fecha">
                        <span>Publicado el ${formatearFecha(tema.fecha_creacion)}</span>
                        <span>•</span>
                        <span>${tema.vistas} vistas</span>
                    </div>
                </div>
            </div>
            <div class="hilo-contenido">
                <p>${tema.contenido}</p>
            </div>
        `;
    }

    const infoPublicado = document.getElementById('info-publicado');
    if (infoPublicado) infoPublicado.textContent = formatearFecha(tema.fecha_creacion);

    const infoVistas = document.getElementById('info-vistas');
    if (infoVistas) infoVistas.textContent = tema.vistas;

    const infoCategoria = document.getElementById('info-categoria');
    if (infoCategoria) infoCategoria.textContent = tema.categoria;

    const linkCompleta = document.getElementById('link-respuesta-completa');
    if (linkCompleta) linkCompleta.href = `foro-responder.html?id=${tema.id}`;
}

function renderizarRespuestas(respuestas) {
    const contador = document.getElementById('respuestas-contador');
    if (contador) {
        contador.textContent = `${respuestas.length} Respuesta${respuestas.length === 1 ? '' : 's'}`;
    }

    const infoRespuestas = document.getElementById('info-respuestas');
    if (infoRespuestas) infoRespuestas.textContent = respuestas.length;

    const contenedor = document.getElementById('respuestas-contenedor');
    if (!contenedor) return;

    if (respuestas.length === 0) {
        contenedor.innerHTML = '<p style="padding:1.5rem 0;color:#666;">Todavía no hay respuestas. ¡Sé el primero en responder!</p>';
        return;
    }

    contenedor.innerHTML = respuestas.map(r => `
        <article class="hilo-respuesta">
            <div class="respuesta-sidebar">
                <div class="autor-avatar">${iniciales(r.autor_nombre)}</div>
                <div class="votos-control">
                    <span class="votos-count">${r.likes || 0}</span>
                </div>
            </div>
            <div class="respuesta-body">
                <div class="respuesta-autor-meta">
                    <strong>${r.autor_nombre || 'Usuario'}</strong>
                    <span>•</span>
                    <span>${formatearFecha(r.fecha_creacion)}</span>
                </div>
                <div class="respuesta-contenido">
                    <p>${r.contenido}</p>
                </div>
            </div>
        </article>
    `).join('');
}

// Respuesta rápida directamente desde el hilo
function inicializarRespuestaRapida() {
    const btnEnviar = document.querySelector('.btn-enviar-rapido');
    if (!btnEnviar) return;

    btnEnviar.addEventListener('click', async function () {
        const sesionRaw = localStorage.getItem('usuario_ttdt');
        if (!sesionRaw) {
            alert('Debes iniciar sesión para responder.');
            window.location.href = 'login.html';
            return;
        }

        let sesion;
        try {
            sesion = JSON.parse(sesionRaw);
        } catch (e) {
            window.location.href = 'login.html';
            return;
        }

        const textarea = document.querySelector('.respuesta-rapida textarea');
        const contenido = textarea ? textarea.value.trim() : '';
        if (contenido.length < 10) {
            alert('Tu respuesta debe tener al menos 10 caracteres.');
            return;
        }

        const id = obtenerIdDesdeURL();
        if (!id) return;

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';

        try {
            const respuesta = await fetch(`${API_URL}/api/foro/publicaciones/${id}/respuestas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: sesion.id, contenido })
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json().catch(() => ({}));
                throw new Error(errorData.error || 'No se pudo enviar la respuesta.');
            }

            textarea.value = '';
            await cargarHilo();

        } catch (error) {
            alert(error.message);
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar respuesta';
        }
    });
}

// ── GUARDAR Y REPORTAR HILO ──────────────────────────────────────────
function leerSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');
    if (!sesionRaw) return null;
    try {
        return JSON.parse(sesionRaw);
    } catch (e) {
        return null;
    }
}

async function inicializarAccionesHilo() {
    const id = obtenerIdDesdeURL();
    if (!id) return;

    const btnGuardar = document.getElementById('btn-guardar');
    const btnReportar = document.getElementById('btn-reportar');
    const sesion = leerSesion();

    // Reflejar si el usuario ya tenía este hilo guardado
    if (btnGuardar && sesion && sesion.id) {
        try {
                const resp = await fetch(`${API_URL}/api/foro/publicaciones/${id}/guardado?usuario_id=${sesion.id}`);
            const datos = await resp.json();
            if (datos.guardado) {
                btnGuardar.textContent = 'Guardado ✓';
            }
        } catch (e) {
            console.error('No se pudo consultar el estado de guardado', e);
        }
    }

    if (btnGuardar) {
        btnGuardar.addEventListener('click', async function () {
            const sesionActual = leerSesion();
            if (!sesionActual) {
                alert('Debes iniciar sesión para guardar hilos.');
                window.location.href = 'login.html';
                return;
            }

            const yaGuardado = btnGuardar.textContent.includes('Guardado');
            btnGuardar.disabled = true;

            try {
                const resp = await fetch(`${API_URL}/api/foro/publicaciones/${id}/guardar`, {
                    method: yaGuardado ? 'DELETE' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: sesionActual.id })
                });

                if (!resp.ok) throw new Error('No se pudo actualizar el guardado');
                const datos = await resp.json();
                btnGuardar.textContent = datos.guardado ? 'Guardado ✓' : 'Guardar';

            } catch (error) {
                alert('Hubo un problema al guardar el hilo.');
            } finally {
                btnGuardar.disabled = false;
            }
        });
    }

    if (btnReportar) {
        btnReportar.addEventListener('click', async function () {
            const sesionActual = leerSesion();
            if (!sesionActual) {
                alert('Debes iniciar sesión para reportar contenido.');
                window.location.href = 'login.html';
                return;
            }

            const confirmar = confirm('¿Seguro que quieres reportar este hilo? Un moderador lo revisará.');
            if (!confirmar) return;

            btnReportar.disabled = true;
            try {
                const resp = await fetch(`${API_URL}/api/foro/publicaciones/${id}/reportar`, {
                    method: 'POST'
                });
                if (!resp.ok) throw new Error('No se pudo reportar');
                btnReportar.textContent = 'Reportado';
            } catch (error) {
                alert('Hubo un problema al reportar el hilo.');
                btnReportar.disabled = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarHilo();
    inicializarRespuestaRapida();
    inicializarAccionesHilo();
});