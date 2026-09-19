const URL_API = "http://localhost:3000/api";

// ── LEER SESIÓN (misma clave que el resto del sitio) ─────────────────
function leerSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');
    if (!sesionRaw) return null;
    try {
        return JSON.parse(sesionRaw);
    } catch (e) {
        return null;
    }
}

// ── VERIFICAR SESIÓN ──────────────────────────────────────────
function verificarSesion() {
    const sesion = leerSesion();
    if (!sesion || !sesion.id) {
        window.location.href = 'login.html';
        return null;
    }
    return sesion;
}

function iniciales(nombre, apellido) {
    const n = (nombre || '').trim().charAt(0).toUpperCase();
    const a = (apellido || '').trim().charAt(0).toUpperCase();
    return (n + a) || 'U';
}

function urlFotoPerfil(fotoPerfil) {
    if (!fotoPerfil) return '';
    return fotoPerfil.startsWith('http') ? fotoPerfil : `${URL_API.replace('/api', '')}${fotoPerfil}`;
}

function renderizarAvatar(elemento, usuario) {
    if (!elemento) return;
    elemento.innerHTML = '';
    const foto = urlFotoPerfil(usuario.fotoPerfil);
    if (foto) {
        const imagen = document.createElement('img');
        imagen.src = foto;
        imagen.alt = `Foto de perfil de ${usuario.nombre || 'usuario'}`;
        elemento.appendChild(imagen);
    } else {
        elemento.textContent = iniciales(usuario.nombre, usuario.apellido);
    }
}

function escaparHTML(valor) {
    return String(valor || '').replace(/[&<>'"]/g, caracter => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[caracter]));
}

async function leerRespuestaJSON(respuesta) {
    const texto = await respuesta.text();
    try {
        return JSON.parse(texto);
    } catch (error) {
        throw new Error(`El servidor respondió con un formato inesperado (${respuesta.status}). Reinicia server.js.`);
    }
}

function actualizarEnlaceMapa() {
    const direccion = document.getElementById('p-direccion')?.value.trim();
    const codigoPostal = document.getElementById('p-codigo-postal')?.value.trim();
    const enlace = document.getElementById('enlace-google-maps');
    if (!enlace) return;

    const consulta = [direccion, codigoPostal].filter(Boolean).join(', ');
    enlace.hidden = !consulta;
    enlace.href = consulta
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
        : '#';
}

// ── CARGAR DATOS REALES DEL PERFIL ────────────────────────────────────
async function cargarPerfil() {
    const sesion = leerSesion();
    if (!sesion) return;

    try {
        const respuesta = await fetch(`${URL_API}/usuarios/${sesion.id}`);
        if (!respuesta.ok) throw new Error('No se pudo cargar el perfil');

        const usuario = await leerRespuestaJSON(respuesta);
        renderizarPerfil(usuario);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

function renderizarPerfil(usuario) {
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Usuario';
    // Header
    const avatarHeader = document.getElementById('perfil-avatar-header');
    const nombreHeader = document.getElementById('perfil-nombre-header');
    renderizarAvatar(avatarHeader, usuario);
    if (nombreHeader) nombreHeader.textContent = nombreCompleto;

    // Sidebar
    const avatarGrande = document.getElementById('perfil-avatar-grande');
    const nombreTitulo = document.getElementById('perfil-nombre-titulo');
    renderizarAvatar(avatarGrande, usuario);
    if (nombreTitulo) nombreTitulo.textContent = nombreCompleto;

    // Formulario "Mis Datos"
    const inputNombre = document.getElementById('p-nombre');
    const inputApellido = document.getElementById('p-apellido');
    const inputEmail = document.getElementById('p-email');
    const inputTelefono = document.getElementById('p-telefono');
    const inputBio = document.getElementById('p-bio');

    if (inputNombre) inputNombre.value = usuario.nombre || '';
    if (inputApellido) inputApellido.value = usuario.apellido || '';
    if (inputEmail) {
        inputEmail.value = usuario.correo || '';
        inputEmail.disabled = true;
        inputEmail.title = 'Por ahora el correo no se puede editar desde aquí';
    }
    if (inputTelefono) inputTelefono.value = usuario.telefono || '';
    if (inputBio) inputBio.value = usuario.bio || '';

    const inputDireccion = document.getElementById('p-direccion');
    const inputCodigoPostal = document.getElementById('p-codigo-postal');
    if (inputDireccion) inputDireccion.value = usuario.direccion || '';
    if (inputCodigoPostal) inputCodigoPostal.value = usuario.codigoPostal || '';
    actualizarEnlaceMapa();
}

function inicializarFotoPerfil() {
    const boton = document.getElementById('btn-cambiar-foto');
    const input = document.getElementById('foto-perfil-input');
    if (!boton || !input) return;

    boton.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
        const archivo = input.files[0];
        const sesion = verificarSesion();
        if (!archivo || !sesion) return;

        boton.disabled = true;
        const textoOriginal = boton.textContent;
        boton.textContent = 'Subiendo...';
        const datos = new FormData();
        datos.append('foto', archivo);

        try {
            const respuesta = await fetch(`${URL_API}/usuarios/${sesion.id}/foto`, {
                method: 'POST',
                body: datos
            });
            const resultado = await leerRespuestaJSON(respuesta);
            if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo subir la foto');

            const sesionActualizada = { ...sesion, fotoPerfil: resultado.fotoPerfil };
            localStorage.setItem('usuario_ttdt', JSON.stringify(sesionActualizada));
            await cargarPerfil();
        } catch (error) {
            alert(error.message);
        } finally {
            input.value = '';
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    });
}

async function cargarPedidos() {
    const contenedor = document.getElementById('perfil-lista-pedidos');
    const sesion = leerSesion();
    if (!contenedor || !sesion) return;

    try {
        const respuesta = await fetch(`${URL_API}/pedidos/${sesion.id}`);
        if (!respuesta.ok) throw new Error('No se pudieron cargar los pedidos');
        const pedidos = await leerRespuestaJSON(respuesta);
        if (!pedidos.length) {
            contenedor.innerHTML = '<p class="perfil-vacio">Todavía no tienes pedidos registrados.</p>';
            return;
        }

        contenedor.innerHTML = pedidos.map(pedido => `
            <article class="pedido-card">
                <div class="pedido-header">
                    <strong>${escaparHTML(pedido.id)}</strong>
                    <span class="pedido-estado">${escaparHTML(pedido.estado)}</span>
                </div>
                <p class="pedido-fecha">${escaparHTML(pedido.fecha)} · ${escaparHTML(pedido.metodo)}</p>
                <div class="pedido-items">
                    ${(pedido.items || []).map(item => `<div class="pedido-item"><span>${escaparHTML(item.nombre)} × ${item.cantidad}</span><strong>$${(Number(item.precio) * Number(item.cantidad)).toFixed(2)}</strong></div>`).join('')}
                </div>
                <div class="pedido-footer"><strong>Total: $${Number(pedido.total).toFixed(2)}</strong><a class="btn-outline" href="factura.html?id=${encodeURIComponent(pedido.id.replace('#CP-', ''))}">Ver factura</a></div>
            </article>
        `).join('');
    } catch (error) {
        contenedor.innerHTML = '<p class="perfil-error">No se pudieron cargar tus pedidos.</p>';
        console.error(error);
    }
}

async function cargarPublicaciones() {
    const contenedor = document.getElementById('perfil-lista-posts');
    const sesion = leerSesion();
    if (!contenedor || !sesion) return;

    try {
        const respuesta = await fetch(`${URL_API}/usuarios/${sesion.id}/publicaciones`);
        if (!respuesta.ok) throw new Error('No se pudieron cargar las publicaciones');
        const datos = await leerRespuestaJSON(respuesta);
        const preguntas = (datos.preguntas || []).map(pregunta => `
            <article class="perfil-post">
                <span class="tema-categoria">Pregunta · ${escaparHTML(pregunta.categoria)}</span>
                <h3><a href="foro-hilo.html?id=${pregunta.id}">${escaparHTML(pregunta.titulo)}</a></h3>
                <p>${escaparHTML(pregunta.contenido).substring(0, 180)}</p>
            </article>
        `);
        const respuestas = (datos.respuestas || []).map(respuesta => `
            <article class="perfil-post">
                <span class="tema-categoria">Respuesta</span>
                <h3><a href="foro-hilo.html?id=${respuesta.id_foro}">${escaparHTML(respuesta.titulo)}</a></h3>
                <p>${escaparHTML(respuesta.contenido).substring(0, 180)}</p>
            </article>
        `);
        const publicaciones = [...preguntas, ...respuestas];
        contenedor.innerHTML = publicaciones.length
            ? publicaciones.join('')
            : '<p class="perfil-vacio">Todavía no has publicado en el foro.</p>';
    } catch (error) {
        contenedor.innerHTML = '<p class="perfil-error">No se pudieron cargar tus publicaciones.</p>';
        console.error(error);
    }
}

// ── GUARDAR CAMBIOS DE "MIS DATOS" ────────────────────────────────────
function inicializarGuardarDatos() {
    const btnGuardar = document.querySelector('#tab-mis-datos .btn-guardar-datos');
    if (!btnGuardar) return;

    btnGuardar.addEventListener('click', async function () {
        const sesion = verificarSesion();
        if (!sesion) return;

        const nombre = document.getElementById('p-nombre').value.trim();
        const apellido = document.getElementById('p-apellido').value.trim();
        const telefono = document.getElementById('p-telefono').value.trim();
        const bio = document.getElementById('p-bio').value.trim();

        if (!nombre) {
            alert('El nombre es obligatorio.');
            return;
        }

        btnGuardar.disabled = true;
        const textoOriginal = btnGuardar.textContent;
        btnGuardar.textContent = 'Guardando...';

        try {
            const respuesta = await fetch(`${URL_API}/usuarios/${sesion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido, telefono, bio })
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json().catch(() => ({}));
                throw new Error(errorData.error || 'No se pudo guardar el perfil.');
            }

            const sesionActualizada = { ...sesion, nombre, apellido, telefono, bio };
            localStorage.setItem('usuario_ttdt', JSON.stringify(sesionActualizada));

            // Actualizar también el nombre en el header/sidebar sin recargar
            renderizarPerfil({ ...sesionActualizada, correo: document.getElementById('p-email').value });

            alert('¡Perfil actualizado con éxito!');

        } catch (error) {
            alert(error.message);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = textoOriginal;
        }
    });
}

function inicializarGuardarDireccion() {
    const boton = document.getElementById('btn-guardar-direccion');
    if (!boton) return;

    ['p-direccion', 'p-codigo-postal'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', actualizarEnlaceMapa);
    });

    boton.addEventListener('click', async () => {
        const sesion = verificarSesion();
        if (!sesion) return;
        const direccion = document.getElementById('p-direccion').value.trim();
        const codigoPostal = document.getElementById('p-codigo-postal').value.trim();
        if (!direccion) {
            document.getElementById('direccion-mensaje').textContent = 'Escribe una dirección antes de guardar.';
            return;
        }

        boton.disabled = true;
        try {
            const perfilRespuesta = await fetch(`${URL_API}/usuarios/${sesion.id}`);
            const usuario = await leerRespuestaJSON(perfilRespuesta);
            const respuesta = await fetch(`${URL_API}/usuarios/${sesion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    telefono: usuario.telefono,
                    bio: usuario.bio,
                    direccion,
                    codigoPostal
                })
            });
            if (!respuesta.ok) throw new Error('No se pudo guardar la dirección');
            localStorage.setItem('usuario_ttdt', JSON.stringify({ ...sesion, direccion, codigoPostal }));
            document.getElementById('direccion-mensaje').textContent = 'Dirección guardada correctamente.';
            actualizarEnlaceMapa();
        } catch (error) {
            document.getElementById('direccion-mensaje').textContent = error.message;
        } finally {
            boton.disabled = false;
        }
    });
}

// ── CERRAR SESIÓN ──────────────────────────────────────────────────
function inicializarCerrarSesion() {
    const botonesCerrar = document.querySelectorAll('.btn-cerrar-sesion, #btn-cerrar-sesion-header');
    botonesCerrar.forEach((btnCerrar) => {
        btnCerrar.addEventListener('click', function () {
            localStorage.removeItem('usuario_ttdt');
            window.location.href = 'index.html';
        });
    });
}

// ── PESTAÑAS (igual que antes, pero sin depender del "event" global) ──
function switchTab(tab, btn) {
    document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.perfil-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    if (btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!verificarSesion()) return;
    cargarPerfil();
    inicializarFotoPerfil();
    cargarPedidos();
    cargarPublicaciones();
    inicializarGuardarDatos();
    inicializarGuardarDireccion();
    inicializarCerrarSesion();
});