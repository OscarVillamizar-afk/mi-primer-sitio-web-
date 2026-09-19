// ---- VERIFICACION DE SESION ----
// OJO: debe usar la MISMA clave que guarda login.js al iniciar sesion
// o registrarse: localStorage.setItem('usuario_ttdt', ...)
function verificarSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');
    const adminLink = document.getElementById('admin-link');
    const vendedorLink = document.getElementById('vendedor-link');
    const loginLink = document.getElementById('login-link');
    const sesionActiva = document.getElementById('sesion-activa');
    const perfilLink = document.getElementById('perfil-link');
    const avatarHeader = document.getElementById('usuario-avatar-header');
    const avatarUsuario = document.getElementById('avatar-usuario');

    if (!sesionRaw) {
        // No hay sesion: mostrar boton de login, ocultar el resto
        loginLink.style.display = 'block';
        sesionActiva.style.display = 'none';
        perfilLink.style.display = 'none';
        avatarHeader.style.display = 'none';
        adminLink.style.display = 'none';
        vendedorLink.style.display = 'none';
        return;
    }

    let sesion;
    try {
        sesion = JSON.parse(sesionRaw);
    } catch (error) {
        console.error('Sesion corrupta en localStorage, se elimina:', error);
        localStorage.removeItem('usuario_ttdt');
        return;
    }

    // Hay sesion activa: ocultar login, mostrar nombre + boton de cerrar sesion
    loginLink.style.display = 'none';
    sesionActiva.style.display = 'flex';
    perfilLink.style.display = 'inline-block';
    avatarHeader.style.display = 'flex';
    avatarUsuario.innerHTML = '';
    if (sesion.fotoPerfil) {
        const imagen = document.createElement('img');
        imagen.src = sesion.fotoPerfil.startsWith('http') ? sesion.fotoPerfil : `http://localhost:3000${sesion.fotoPerfil}`;
        imagen.alt = `Foto de perfil de ${sesion.nombre || 'usuario'}`;
        avatarUsuario.appendChild(imagen);
    } else {
        avatarUsuario.textContent = `${(sesion.nombre || 'U').charAt(0)}${(sesion.apellido || '').charAt(0)}`.toUpperCase();
    }

    // Mostrar el panel correspondiente segun el tipo de cuenta
    adminLink.style.display = (sesion.tipo === 'dueno') ? 'block' : 'none';
    vendedorLink.style.display = (sesion.tipo === 'vendedor') ? 'block' : 'none';
}

// ---- CERRAR SESION ----
function inicializarLogout() {
    const btnLogout = document.getElementById('btn-cerrar-sesion');
    if (!btnLogout) return;

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuario_ttdt');
        window.location.href = 'index.html';
    });
}

// ---- INICIALIZACION ----
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarLogout();
});