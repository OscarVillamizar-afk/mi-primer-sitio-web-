function mostrarPaso2(event) {
    event.preventDefault();
    const email = document.getElementById('recoveryEmail').value;
    if (!email) return;

    document.getElementById('correoEnviado').textContent = email;
    document.getElementById('paso-1').classList.remove('active');
    document.getElementById('paso-2').classList.add('active');
}

function mostrarPaso1() {
    document.getElementById('recoveryEmail').value = '';
    document.getElementById('paso-2').classList.remove('active');
    document.getElementById('paso-1').classList.add('active');
}