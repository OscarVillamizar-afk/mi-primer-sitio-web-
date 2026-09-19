const URL_API = "http://localhost:3000/api";

// ---- FUNCION PARA CAMBIAR DE TAB ----
// Ahora fuerza el display por JS ademas de las clases CSS,
// asi el formulario se muestra aunque falte alguna regla en style.css.
function switchTab(tab, e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length === 0 || contents.length === 0) {
        console.error('switchTab: no se encontraron elementos .tab o .tab-content en el DOM');
        return;
    }

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });

    const targetTab = document.getElementById('tab-' + tab);
    const targetContent = document.getElementById('content-' + tab);

    if (!targetTab || !targetContent) {
        console.error(`switchTab: no existe tab-${tab} o content-${tab} en el HTML`);
        return;
    }

    targetTab.classList.add('active');
    targetContent.classList.add('active');
    targetContent.style.display = 'block';
}

// ---- INICIALIZAR LOS CLICS DE LOS TABS Y LOS ENLACES "cambiar de tab" ----
function inicializarTabs() {
    document.querySelectorAll('.tab[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(btn.dataset.tab, e));
    });

    document.querySelectorAll('.link-switch-tab[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => switchTab(link.dataset.tab, e));
    });

    // Forzamos el estado inicial (login visible) por si el CSS no tenia
    // definido display:block para .tab-content.active
    switchTab('login');
}

// ---- MANEJADOR DEL FORMULARIO DE LOGIN ----
function inicializarLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return;

    formLogin.addEventListener('submit', async function(e) {
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

            const sesionUsuario = {
                id: data.id,
                tipo: data.tipo,
                correo: data.correo,
                nombre: data.nombre
            };
            localStorage.setItem('usuario_ttdt', JSON.stringify(sesionUsuario));

            if (data.tipo === 'dueno') {
                window.location.href = 'dashboard-dueno.html';
            } else if (data.tipo === 'vendedor') {
                window.location.href = 'panel-vendedor.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error("Error en login:", error);
            alert('No se pudo conectar con el servidor.');
        }
    });
}

// ---- MANEJADOR DEL FORMULARIO DE REGISTRO USUARIO ----
function inicializarRegistroUsuario() {
    const formUsuario = document.getElementById('form-usuario');
    if (!formUsuario) return;

    formUsuario.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btnSubmit = formUsuario.querySelector('.btn-submit');
        if (btnSubmit.disabled) return; // ya hay un envio en curso, ignorar clics extra

        const nombre = document.getElementById('usuarioNombre').value.trim();
        const email = document.getElementById('usuarioEmail').value.trim();
        const password = document.getElementById('usuarioPassword').value;
        const passwordConfirm = document.getElementById('usuarioPasswordConfirm').value;
        const direccion = document.getElementById('usuarioDireccion').value.trim();
        const codigoPostal = document.getElementById('usuarioCodigoPostal').value.trim();
        const fechaNac = document.getElementById('usuarioFechaNac').value;
        const terminos = document.getElementById('usuarioTerminos').checked;

        if (password !== passwordConfirm) {
            alert('Las contrasenas no coinciden');
            return;
        }
        if (!terminos) {
            alert('Debes aceptar los terminos y condiciones');
            return;
        }

        btnSubmit.disabled = true;
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Creando cuenta...';

        try {
            const respuesta = await fetch(`${URL_API}/registro/usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, direccion, codigoPostal, fechaNac })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                alert(data.error || 'No se pudo crear la cuenta');
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
                return;
            }

            const sesionUsuario = {
                id: data.id,
                tipo: data.tipo || 'usuario',
                correo: data.correo,
                nombre: data.nombre
            };
            localStorage.setItem('usuario_ttdt', JSON.stringify(sesionUsuario));

            const msg = document.getElementById('successMessage');
            msg.textContent = 'Cuenta creada exitosamente. Redirigiendo...';
            msg.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error("Error en registro de usuario:", error);
            alert('No se pudo conectar con el servidor.');
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    });
}

// ---- MANEJADOR DEL FORMULARIO DE REGISTRO VENDEDOR ----
function inicializarRegistroVendedor() {
    const formVendedor = document.getElementById('form-vendedor');
    if (!formVendedor) return;

    formVendedor.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btnSubmit = formVendedor.querySelector('.btn-submit');
        if (btnSubmit.disabled) return; // ya hay un envio en curso, ignorar clics extra

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
            alert('Las contrasenas no coinciden');
            return;
        }
        if (!terminos) {
            alert('Debes aceptar los terminos para vendedores');
            return;
        }

        btnSubmit.disabled = true;
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Creando cuenta...';

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
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
                return;
            }

            const sesionUsuario = {
                id: data.id,
                tipo: data.tipo || 'vendedor',
                correo: data.correo,
                nombre: data.nombre,
                negocio: negocio
            };
            localStorage.setItem('usuario_ttdt', JSON.stringify(sesionUsuario));

            const msg = document.getElementById('successMessage');
            msg.textContent = 'Cuenta de vendedor creada exitosamente. Redirigiendo...';
            msg.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'panel-vendedor.html';
            }, 1500);
        } catch (error) {
            console.error("Error en registro de vendedor:", error);
            alert('No se pudo conectar con el servidor.');
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    });
}

// ---- INICIALIZACION ----
document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    inicializarLogin();
    inicializarRegistroUsuario();
    inicializarRegistroVendedor();
});