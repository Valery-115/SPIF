document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Cambia la imagen del ojo
        if (type === 'text') {
            togglePassword.src = '../../static/autent/img/esconder.png';
            togglePassword.alt = 'Ocultar contraseña';
        } else {
            togglePassword.src = '../../static/autent/img/mostrar.png';
            togglePassword.alt = 'Mostrar contraseña';
        }
    });
});