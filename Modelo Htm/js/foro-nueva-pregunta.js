const URL_API = "http://localhost:3000/api";

// ── 1. VERIFICAR SESIÓN ───────────────────────────────────────
// Usa la misma clave que auth-header.js: 'usuario_ttdt'
function verificarSesion() {
    const sesionRaw = localStorage.getItem('usuario_ttdt');

    if (!sesionRaw) {
        alert('Debes iniciar sesión para publicar en el foro.');
        window.location.href = 'login.html';
        return null;
    }

    try {
        const sesion = JSON.parse(sesionRaw);
        if (!sesion || !sesion.id) {
            alert('Debes iniciar sesión para publicar en el foro.');
            window.location.href = 'login.html';
            return null;
        }
        return sesion;
    } catch (e) {
        alert('Debes iniciar sesión para publicar en el foro.');
        window.location.href = 'login.html';
        return null;
    }
}

// ── 2. CONTADORES DE CARACTERES ───────────────────────────────
function inicializarContadores() {
    // Contador: Título
    const inputTitulo = document.getElementById('titulo');
    if (inputTitulo) {
        inputTitulo.addEventListener('input', function () {
            const cantidad = this.value.length;
            const elCount = document.getElementById('titulo-count');
            if (elCount) {
                elCount.textContent = cantidad;
                const contadorWrap = elCount.parentElement;
                if (contadorWrap) {
                    contadorWrap.style.color = cantidad >= 130 ? 'red' : '';
                }
            }
        });
    }

    // Contador: Descripción
    const inputDesc = document.getElementById('descripcion');
    if (inputDesc) {
        inputDesc.addEventListener('input', function () {
            const cantidad = this.value.length;
            const elCount = document.getElementById('desc-count');
            if (elCount) {
                elCount.textContent = cantidad;
                const contadorWrap = elCount.parentElement;
                if (contadorWrap) {
                    contadorWrap.style.color = cantidad >= 50 ? 'green' : 'red';
                }
            }
        });
    }
}

// ── 3. VISTA PREVIA DE ARCHIVOS ADJUNTOS ───────────────────────
function inicializarAdjuntos() {
    const inputArchivo = document.getElementById('archivo-adjunto');
    if (inputArchivo) {
        inputArchivo.addEventListener('change', function () {
            const preview = document.getElementById('archivos-preview');
            if (!preview) return;

            preview.innerHTML = ''; // Limpiar vista previa anterior

            // Máximo 3 archivos permitidos
            const archivos = Array.from(this.files).slice(0, 3);

            archivos.forEach(function (archivo) {
                const etiqueta = document.createElement('span');
                etiqueta.style.cssText = 'display:inline-block; margin:4px 8px 4px 0; padding:4px 10px; background:#f0f0f0; border-radius:20px; font-size:0.85rem; color:#333;';
                etiqueta.textContent = '📎 ' + archivo.name;
                preview.appendChild(etiqueta);
            });
        });
    }
}

// ── 4. VALIDACIÓN Y ENVÍO AL BACKEND ──────────────────────────
function inicializarPublicacion() {
    const btnPublicar = document.querySelector('.btn-publicar');
    if (!btnPublicar) return;

    btnPublicar.addEventListener('click', async function (e) {
        e.preventDefault();

        const sesion = verificarSesion();
        if (!sesion) return;

        let hayErrores = false;

        // Validar Título
        const titulo = document.getElementById('titulo').value.trim();
        const errorTitulo = document.getElementById('error-titulo');
        if (titulo.length < 10) {
            if (errorTitulo) errorTitulo.textContent = 'El título debe tener al menos 10 caracteres.';
            hayErrores = true;
        } else if (errorTitulo) {
            errorTitulo.textContent = '';
        }

        // Validar Categoría
        const categoria = document.getElementById('categoria').value;
        const errorCategoria = document.getElementById('error-categoria');
        if (!categoria) {
            if (errorCategoria) errorCategoria.textContent = 'Selecciona una categoría.';
            hayErrores = true;
        } else if (errorCategoria) {
            errorCategoria.textContent = '';
        }

        // Validar Descripción
        const descripcion = document.getElementById('descripcion').value.trim();
        const errorDesc = document.getElementById('error-descripcion');
        if (descripcion.length < 50) {
            if (errorDesc) errorDesc.textContent = 'La descripción debe tener al menos 50 caracteres.';
            hayErrores = true;
        } else if (errorDesc) {
            errorDesc.textContent = '';
        }

        // Validar Términos
        const terminosEl = document.getElementById('terminos-foro');
        const terminos = terminosEl ? terminosEl.checked : false;
        const errorTerminos = document.getElementById('error-terminos-foro');
        if (!terminos) {
            if (errorTerminos) errorTerminos.textContent = 'Debes aceptar las normas del foro.';
            hayErrores = true;
        } else if (errorTerminos) {
            errorTerminos.textContent = '';
        }

        if (hayErrores) return;

        // Deshabilitar botón durante el envío
        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Publicando...';

        try {
            // Construir formulario con datos y archivos adjuntos (Multipart Form Data)
            const formData = new FormData();
            formData.append('usuario_id', sesion.id);
            formData.append('titulo', titulo);
            formData.append('categoria', categoria);
            formData.append('contenido', descripcion);

            const inputArchivo = document.getElementById('archivo-adjunto');
            if (inputArchivo && inputArchivo.files.length > 0) {
                Array.from(inputArchivo.files).slice(0, 3).forEach(file => {
                    formData.append('adjuntos', file);
                });
            }

            const respuesta = await fetch(`${URL_API}/foro/publicaciones`, {
                method: 'POST',
                body: formData // Nota: No incluir Content-Type header cuando se usa FormData
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al guardar la publicación en el servidor.');
            }

            const resultado = await respuesta.json();
            alert('¡Publicación creada exitosamente!');
            window.location.href = `foro.html?id=${resultado.id || ''}`;

        } catch (error) {
            console.error('Error al enviar la publicación:', error);
            alert(error.message || 'Hubo un problema al intentar publicar. Inténtalo de nuevo.');
            btnPublicar.disabled = false;
            btnPublicar.textContent = 'Publicar';
        }
    });
}

// ── 5. BOTÓN VISTA PREVIA ──────────────────────────────────────
function inicializarVistaPrevia() {
    const btnPreview = document.querySelector('.btn-preview');
    if (btnPreview) {
        btnPreview.addEventListener('click', function (e) {
            e.preventDefault();
            const titulo = document.getElementById('titulo').value || '(Sin título)';
            const desc = document.getElementById('descripcion').value || '(Sin descripción)';
            alert('VISTA PREVIA\n\nTítulo: ' + titulo + '\n\nDescripción:\n' + desc);
        });
    }
}

// ── INICIALIZACIÓN GENERAL ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarContadores();
    inicializarAdjuntos();
    inicializarPublicacion();
    inicializarVistaPrevia();
});