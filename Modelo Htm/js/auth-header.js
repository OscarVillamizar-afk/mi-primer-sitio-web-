function renderizarAvatarHeader(elemento, usuario) {
    elemento.innerHTML = '';
    if (usuario.fotoPerfil) {
        const imagen = document.createElement('img');
        imagen.src = usuario.fotoPerfil.startsWith('http')
            ? usuario.fotoPerfil
            : `http://localhost:3000${usuario.fotoPerfil}`;
        imagen.alt = `Foto de perfil de ${usuario.nombre || 'usuario'}`;
        elemento.appendChild(imagen);
        return;
    }
    elemento.textContent = `${(usuario.nombre || 'U').charAt(0)}${(usuario.apellido || '').charAt(0)}`.toUpperCase();
}

// ── VERIFICAR SESIÓN Y ACTUALIZAR EL HEADER (usar en todas las páginas) ──
function verificarSesionHeader() {
    const contenedorAcciones = document.querySelector('.header-actions');
    if (!contenedorAcciones) return;

    const linkLogin = contenedorAcciones.querySelector('a[href="login.html"]');
    const menuUsuarioExistente = contenedorAcciones.querySelector('.usuario-menu');

    const sesionGuardada = localStorage.getItem('usuario_ttdt');
    if (!sesionGuardada) {
        if (menuUsuarioExistente) menuUsuarioExistente.style.display = 'none';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(sesionGuardada);
    } catch (e) {
        localStorage.removeItem('usuario_ttdt');
        return;
    }

    const avatarHeader = menuUsuarioExistente || document.createElement('div');
    avatarHeader.className = 'usuario-menu';
    avatarHeader.style.display = 'flex';
    avatarHeader.setAttribute('aria-label', `Usuario ${usuario.nombre || ''}`.trim());
    const avatar = avatarHeader.querySelector('.autor-avatar') || document.createElement('div');
    avatar.className = 'autor-avatar';
    renderizarAvatarHeader(avatar, usuario);
    if (!avatar.parentElement) avatarHeader.appendChild(avatar);
    if (!menuUsuarioExistente) contenedorAcciones.insertBefore(avatarHeader, linkLogin || contenedorAcciones.firstChild);

    if (!linkLogin) return;

    const navegacion = document.querySelector('header nav');
    if (navegacion && !navegacion.querySelector('a[href="perfil.html"]')) {
        const enlacePerfil = document.createElement('a');
        enlacePerfil.href = 'perfil.html';
        enlacePerfil.textContent = 'Perfil';
        navegacion.appendChild(enlacePerfil);
    }

    const nuevoBloque = document.createElement('div');
    nuevoBloque.classList.add('sesion-activa');
    nuevoBloque.style.display = 'flex';
    nuevoBloque.style.alignItems = 'center';
    nuevoBloque.style.gap = '10px';

    const botonCerrar = document.createElement('button');
    botonCerrar.className = 'btn-login';
    botonCerrar.type = 'button';
    botonCerrar.id = 'btnCerrarSesion';
    botonCerrar.textContent = 'Cerrar Sesión';

    nuevoBloque.appendChild(botonCerrar);
    linkLogin.replaceWith(nuevoBloque);

    botonCerrar.addEventListener('click', () => {
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