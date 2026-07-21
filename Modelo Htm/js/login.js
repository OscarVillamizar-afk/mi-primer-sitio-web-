const URL_API = "http://localhost:3000/api";

// ── FUNCIÓN PARA CAMBIAR DE TAB ─────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('content-' + tab).classList.add('active');
}

// ── MANEJADOR DEL FORMULARIO DE LOGIN ────────────────────────
function inicializarLogin() {
    document.getElementById('form-login').addEventListener('submit', async function(e) {
        e.preventDefault();

        const tipoUsuario = document.getElementById('loginTipo').value;
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!tipoUsuario || !email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            const respuesta = await fetch(`${URL_API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipoUsuario, email, password })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                alert(data.error || 'Credenciales incorrectas');
                return;
            }

            localStorage.setItem('usuario_id', data.id);
            localStorage.setItem('usuario_tipo', data.tipo);
            localStorage.setItem('usuario_email', data.correo);
            localStorage.setItem('usuario_nombre', data.nombre);
            localStorage.setItem('usuario_logueado', 'true');

            if (tipoUsuario === 'dueno') {
                window.location.href = 'dashboard-dueno.html';
            } else if (tipoUsuario === 'vendedor') {
                window.location.href = 'panel-vendedor.html';
            } else if (tipoUsuario === 'usuario') {
                window.location.href = 'perfil.html';
            }
        } catch (error) {
            console.error("Error en login:", error);
            alert('No se pudo conectar con el servidor.');
        }
    });
}

// ── MANEJADOR DEL FORMULARIO DE REGISTRO USUARIO ──────────────
function inicializarRegistroUsuario() {
    document.getElementById('form-usuario').addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('usuarioNombre').value.trim();
        const email = document.getElementById('usuarioEmail').value.trim();
        const password = document.getElementById('usuarioPassword').value;
        const passwordConfirm = document.getElementById('usuarioPasswordConfirm').value;
        const direccion = document.getElementById('usuarioDireccion').value.trim();
        const codigoPostal = document.getElementById('usuarioCodigoPostal').value.trim();
        const fechaNac = document.getElementById('usuarioFechaNac').value;
        const terminos = document.getElementById('usuarioTerminos').checked;

        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (!terminos) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        try {
            const respuesta = await fetch(`${URL_API}/registro/usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, direccion, codigoPostal, fechaNac })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                alert(data.error || 'No se pudo crear la cuenta');
                return;
            }

            localStorage.setItem('usuario_id', data.id);
            localStorage.setItem('usuario_tipo', data.tipo);
            localStorage.setItem('usuario_email', data.correo);
            localStorage.setItem('usuario_nombre', data.nombre);
            localStorage.setItem('usuario_logueado', 'true');

            document.getElementById('successMessage').textContent = 'Cuenta creada exitosamente. Redirigiendo...';
            document.getElementById('successMessage').style.display = 'block';

            setTimeout(() => {
                window.location.href = 'perfil.html';
            }, 2000);
        } catch (error) {
            console.error("Error en registro de usuario:", error);
            alert('No se pudo conectar con el servidor.');
        }
    });
}

// ── MANEJADOR DEL FORMULARIO DE REGISTRO VENDEDOR ───────────────
function inicializarRegistroVendedor() {
    document.getElementById('form-vendedor').addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('vendedorNombre').value.trim();
        const email = document.getElementById('vendedorEmail').value.trim();
        const password = document.getElementById('vendedorPassword').value;
        const passwordConfirm = document.getElementById('vendedorPasswordConfirm').value;
        const direccion = document.getElementById('vendedorDireccion').value.trim();
        const codigoPostal = document.getElementById('vendedorCodigoPostal').value.trim();
        const fechaNac = document.getElementById('vendedorFechaNac').value;
        const negocio = document.getElementById('vendedorNegocio').value.trim();
        const telefono = document.getElementById('vendedorTelefono').value.trim();
        const categoria = document.getElementById('vendedorCategoria').value;
        const descripcion = document.getElementById('vendedorDescripcion').value.trim();
        const terminos = document.getElementById('vendedorTerminos').checked;

        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (!terminos) {
            alert('Debes aceptar los términos para vendedores');
            return;
        }

        try {
            const respuesta = await fetch(`${URL_API}/registro/vendedor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre, email, password, direccion, codigoPostal, fechaNac,
                    negocio, telefono, categoria, descripcion
                })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                alert(data.error || 'No se pudo crear la cuenta de vendedor');
                return;
            }

            localStorage.setItem('usuario_id', data.id);
            localStorage.setItem('usuario_tipo', data.tipo);
            localStorage.setItem('usuario_email', data.correo);
            localStorage.setItem('usuario_nombre', data.nombre);
            localStorage.setItem('usuario_negocio', negocio);
            localStorage.setItem('usuario_logueado', 'true');

            document.getElementById('successMessage').textContent = 'Cuenta de vendedor creada exitosamente. Redirigiendo...';
            document.getElementById('successMessage').style.display = 'block';

            setTimeout(() => {
                window.location.href = 'panel-vendedor.html';
            }, 2000);
        } catch (error) {
            console.error("Error en registro de vendedor:", error);
            alert('No se pudo conectar con el servidor.');
        }
    });
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
inicializarLogin();
inicializarRegistroUsuario();
inicializarRegistroVendedor();