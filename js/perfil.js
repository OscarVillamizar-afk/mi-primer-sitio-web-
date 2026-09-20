// ── VERIFICAR SESIÓN ──────────────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'usuario') {
        // Si no está logueado o no es usuario, redirigir a login
        window.location.href = 'login.html';
    }
}

// Verificar sesión al cargar la página
verificarSesion();

function switchTab(tab) {
    document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.perfil-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
}