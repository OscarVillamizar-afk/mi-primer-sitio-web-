// ── VERIFICACIÓN DE SESIÓN ─────────────────────────────────────
// OJO: debe usar la MISMA clave que guarda login.js al iniciar sesión
// o registrarse: localStorage.setItem('usuario_ttdt', ...)
function verificarSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');
    const adminLink = document.getElementById('admin-link');
    const vendedorLink = document.getElementById('vendedor-link');
    const loginLink = document.getElementById('login-link');
    const sesionActiva = document.getElementById('sesion-activa');
    const nombreUsuario = document.getElementById('nombre-usuario');

    if (!sesionRaw) {
        // No hay sesión: mostrar botón de login, ocultar el resto
        loginLink.style.display = 'block';
        sesionActiva.style.display = 'none';
        adminLink.style.display = 'none';
        vendedorLink.style.display = 'none';
        return;
    }

    let sesion;
    try {
        sesion = JSON.parse(sesionRaw);
    } catch (error) {
        console.error('Sesión corrupta en localStorage, se elimina:', error);
        localStorage.removeItem('usuario_ttdt');
        return;
    }

    // Hay sesión activa: ocultar login, mostrar nombre + botón de cerrar sesión
    loginLink.style.display = 'none';
    sesionActiva.style.display = 'flex';
    nombreUsuario.textContent = `Hola, ${sesion.nombre || 'Usuario'}`;

    // Mostrar el panel correspondiente según el tipo de cuenta
    adminLink.style.display = (sesion.tipo === 'dueno') ? 'block' : 'none';
    vendedorLink.style.display = (sesion.tipo === 'vendedor') ? 'block' : 'none';
}

// ── CERRAR SESIÓN ───────────────────────────────────────────────
function inicializarLogout() {
    const btnLogout = document.getElementById('btn-cerrar-sesion');
    if (!btnLogout) return;

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuario_ttdt');
        window.location.href = 'index.html';
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarLogout();
});