// ── VERIFICAR SESIÓN ──────────────────────────────────────────
function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    if (!usuarioLogueado || usuarioTipo !== 'vendedor') {
        // Si no está logueado o no es vendedor, redirigir a login
        window.location.href = 'login.html';
    }
}

// Verificar sesión al cargar la página
verificarSesion();

function switchTab(tab) {
    document.querySelectorAll('.vendedor-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.vendedor-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
}

// ── CERRAR SESIÓN ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('a[href="index.html"] button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

// Verificar sesión al cargar la página
verificarSesion();