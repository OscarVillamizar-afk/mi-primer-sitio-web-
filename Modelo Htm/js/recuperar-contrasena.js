const URL_API = "http://localhost:3000/api";

async function mostrarPaso2(event) {
    event.preventDefault();
    const email = document.getElementById('recoveryEmail').value.trim();
    if (!email) return;

    const btnEnviar = event.target.querySelector('button[type="submit"]') || event.submitter;
    if (btnEnviar) btnEnviar.disabled = true;

    try {
        const respuesta = await fetch(`${URL_API}/recuperar-contrasena`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error || 'No se pudo procesar la solicitud.');
            if (btnEnviar) btnEnviar.disabled = false;
            return;
        }

        document.getElementById('correoEnviado').textContent = email;
        document.getElementById('paso-1').classList.remove('active');
        document.getElementById('paso-2').classList.add('active');

        // Mientras no haya envío real de correo, mostramos el link en consola para poder probar
        if (data.link_simulado) {
            console.log('Link de recuperación (simulado):', data.link_simulado);
        }
    } catch (error) {
        console.error("Error en recuperación:", error);
        alert('No se pudo conectar con el servidor.');
        if (btnEnviar) btnEnviar.disabled = false;
    }
}

function mostrarPaso1() {
    document.getElementById('recoveryEmail').value = '';
    document.getElementById('paso-2').classList.remove('active');
    document.getElementById('paso-1').classList.add('active');
}