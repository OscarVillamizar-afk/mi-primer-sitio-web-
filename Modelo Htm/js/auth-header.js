// ── VERIFICAR SESIÓN Y ACTUALIZAR EL HEADER (usar en todas las páginas) ──
function verificarSesionHeader() {
    const contenedorAcciones = document.querySelector('.header-actions');
    if (!contenedorAcciones) return;

    const linkLogin = contenedorAcciones.querySelector('a[href="login.html"]');
    if (!linkLogin) return; // ya no hay botón de login en este header

    const sesionGuardada = localStorage.getItem('usuario_ttdt');
    if (!sesionGuardada) return; // no hay sesión, dejamos el botón de login tal cual

    let usuario;
    try {
        usuario = JSON.parse(sesionGuardada);
    } catch (e) {
        localStorage.removeItem('usuario_ttdt');
        return;
    }

    const nuevoBloque = document.createElement('div');
    nuevoBloque.classList.add('sesion-activa');
    nuevoBloque.innerHTML = `
        <span class="usuario-nombre">${usuario.nombre}</span>
        <button class="btn-login" id="btnCerrarSesion">Cerrar Sesión</button>
    `;
    linkLogin.replaceWith(nuevoBloque);

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.removeItem('usuario_ttdt');
        window.location.href = 'index.html';
    });
}

// ── FUNCIÓN AUXILIAR: exigir sesión en páginas protegidas ────
// Úsala en foro-nueva-pregunta.html y foro-responder.html
function exigirSesion() {
    const sesionGuardada = localStorage.getItem('usuario_ttdt');
    if (!sesionGuardada) {
        alert('Debes iniciar sesión para continuar');
        window.location.href = 'login.html';
        return null;
    }
    try {
        return JSON.parse(sesionGuardada);
    } catch (e) {
        localStorage.removeItem('usuario_ttdt');
        window.location.href = 'login.html';
        return null;
    }
}

document.addEventListener('DOMContentLoaded', verificarSesionHeader);