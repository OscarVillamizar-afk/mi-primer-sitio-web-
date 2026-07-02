// ── VERIFICACIÓN DE SESIÓN DE ADMINISTRADOR ───────────────────
function verificarSesionAdmin() {
    const sesion = JSON.parse(localStorage.getItem('sesionTT&DT'));
    if (sesion && sesion.tipo === 'dueno') {
        document.getElementById('admin-link').style.display = 'block';
    }
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
verificarSesionAdmin();
