// ── CONTADOR DE CARACTERES: Título ───────────────────────────
// Muestra cuántos caracteres lleva el usuario mientras escribe el título
document.getElementById('titulo').addEventListener('input', function() {
    const cantidad = this.value.length;
    document.getElementById('titulo-count').textContent = cantidad;

    // Si se acerca al límite (130+), pone el contador en rojo de advertencia
    const contador = document.getElementById('titulo-count').parentElement;
    contador.style.color = cantidad >= 130 ? 'red' : '';
});


// ── CONTADOR DE CARACTERES: Descripción ─────────────────────
document.getElementById('descripcion').addEventListener('input', function() {
    const cantidad = this.value.length;
    document.getElementById('desc-count').textContent = cantidad;

    // Verde si ya tiene los 50 caracteres mínimos, rojo si no
    const contador = document.getElementById('desc-count').parentElement;
    contador.style.color = cantidad >= 50 ? 'green' : 'red';
});


// ── VISTA PREVIA DE ARCHIVOS ADJUNTOS ───────────────────────
// Cuando el usuario selecciona imágenes, muestra los nombres de los archivos
document.getElementById('archivo-adjunto').addEventListener('change', function() {
    const preview = document.getElementById('archivos-preview');
    preview.innerHTML = ''; // Limpia la vista previa anterior

    // Máximo 3 archivos permitidos
    const archivos = Array.from(this.files).slice(0, 3);

    archivos.forEach(function(archivo) {
        const etiqueta = document.createElement('span');
        etiqueta.style.cssText = 'display:inline-block; margin:4px 8px 4px 0; padding:4px 10px; background:#f0f0f0; border-radius:20px; font-size:0.85rem;';
        etiqueta.textContent = '' + archivo.name;
        preview.appendChild(etiqueta);
    });
});


// ── VALIDACIÓN AL PUBLICAR ───────────────────────────────────
document.querySelector('.btn-publicar').addEventListener('click', function() {

    let hayErrores = false;

    const titulo = document.getElementById('titulo').value.trim();
    const errorTitulo = document.getElementById('error-titulo');
    if (titulo.length < 10) {
        errorTitulo.textContent = 'El título debe tener al menos 10 caracteres.';
        hayErrores = true;
    } else {
        errorTitulo.textContent = '';
    }

    const categoria = document.getElementById('categoria').value;
    const errorCategoria = document.getElementById('error-categoria');
    if (!categoria) {
        errorCategoria.textContent = 'Selecciona una categoría.';
        hayErrores = true;
    } else {
        errorCategoria.textContent = '';
    }

    const descripcion = document.getElementById('descripcion').value.trim();
    const errorDesc = document.getElementById('error-descripcion');
    if (descripcion.length < 50) {
        errorDesc.textContent = 'La descripción debe tener al menos 50 caracteres.';
        hayErrores = true;
    } else {
        errorDesc.textContent = '';
    }

    const terminos = document.getElementById('terminos-foro').checked;
    const errorTerminos = document.getElementById('error-terminos-foro');
    if (!terminos) {
        errorTerminos.textContent = 'Debes aceptar las normas del foro.';
        hayErrores = true;
    } else {
        errorTerminos.textContent = '';
    }

    if (!hayErrores) {
        document.getElementById('form-foro').submit();
    }
});


// ── BOTÓN VISTA PREVIA ───────────────────────────────────────
document.querySelector('.btn-preview').addEventListener('click', function() {
    const titulo = document.getElementById('titulo').value || '(Sin título)';
    const desc   = document.getElementById('descripcion').value || '(Sin descripción)';
    alert('VISTA PREVIA\n\nTítulo: ' + titulo + '\n\nDescripción:\n' + desc);
});