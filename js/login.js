// ── FUNCIÓN PARA CAMBIAR DE TAB ─────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('content-' + tab).classList.add('active');
}

// ── MANEJADOR DEL FORMULARIO DE LOGIN ────────────────────────
function inicializarLogin() {
    document.getElementById('form-login').addEventListener('submit', function(e) {
        e.preventDefault();

        const tipoUsuario = document.getElementById('loginTipo').value;
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validación simple
        if (!tipoUsuario || !email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Credenciales de prueba
        let credencialesValidas = false;
        if (tipoUsuario === 'dueno' && email === 'admin@admin.com' && password === 'admin') {
            credencialesValidas = true;
        } else if (tipoUsuario === 'vendedor' && email === 'vendedor@vendedor.com' && password === 'vendedor') {
            credencialesValidas = true;
        } else if (tipoUsuario === 'usuario' && email === 'usuario@usuario.com' && password === 'usuario') {
            credencialesValidas = true;
        }

        if (!credencialesValidas) {
            alert('Credenciales incorrectas. Para pruebas:\n- Admin: admin@admin.com / admin\n- Vendedor: vendedor@vendedor.com / vendedor\n- Usuario: usuario@usuario.com / usuario');
            return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('usuario_tipo', tipoUsuario);
        localStorage.setItem('usuario_email', email);
        localStorage.setItem('usuario_nombre', email.split('@')[0]);
        localStorage.setItem('usuario_logueado', 'true');

        // Redirigir según el tipo de usuario
        if (tipoUsuario === 'dueno') {
            // Redirigir al dashboard del dueño
            window.location.href = 'dashboard-dueno.html';
        } else if (tipoUsuario === 'vendedor') {
            // Redirigir al panel del vendedor
            window.location.href = 'panel-vendedor.html';
        } else if (tipoUsuario === 'usuario') {
            // Redirigir al perfil del usuario o al catálogo
            window.location.href = 'perfil.html';
        }
    });
}

// ── MANEJADOR DEL FORMULARIO DE REGISTRO USUARIO ──────────────
function inicializarRegistroUsuario() {
    document.getElementById('form-usuario').addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('usuarioNombre').value;
        const email = document.getElementById('usuarioEmail').value;
        const password = document.getElementById('usuarioPassword').value;
        const passwordConfirm = document.getElementById('usuarioPasswordConfirm').value;
        const terminos = document.getElementById('usuarioTerminos').checked;

        // Validaciones
        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!terminos) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('usuario_tipo', 'usuario');
        localStorage.setItem('usuario_email', email);
        localStorage.setItem('usuario_nombre', nombre);
        localStorage.setItem('usuario_logueado', 'true');

        // Mostrar mensaje de éxito y redirigir
        document.getElementById('successMessage').textContent = 'Cuenta creada exitosamente. Redirigiendo...';
        document.getElementById('successMessage').style.display = 'block';

        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 2000);
    });
}

// ── MANEJADOR DEL FORMULARIO DE REGISTRO VENDEDOR ───────────────
function inicializarRegistroVendedor() {
    document.getElementById('form-vendedor').addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('vendedorNombre').value;
        const email = document.getElementById('vendedorEmail').value;
        const password = document.getElementById('vendedorPassword').value;
        const passwordConfirm = document.getElementById('vendedorPasswordConfirm').value;
        const negocio = document.getElementById('vendedorNegocio').value;
        const terminos = document.getElementById('vendedorTerminos').checked;

        // Validaciones
        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!terminos) {
            alert('Debes aceptar los términos para vendedores');
            return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('usuario_tipo', 'vendedor');
        localStorage.setItem('usuario_email', email);
        localStorage.setItem('usuario_nombre', nombre);
        localStorage.setItem('usuario_negocio', negocio);
        localStorage.setItem('usuario_logueado', 'true');

        // Mostrar mensaje de éxito y redirigir
        document.getElementById('successMessage').textContent = 'Cuenta de vendedor creada exitosamente. Redirigiendo...';
        document.getElementById('successMessage').style.display = 'block';

        setTimeout(() => {
            window.location.href = 'panel-vendedor.html';
        }, 2000);
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
inicializarLogin();
inicializarRegistroUsuario();
inicializarRegistroVendedor();
