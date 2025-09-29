document.addEventListener('DOMContentLoaded', () => {
    // Manejo del primer nivel de submenú
    const submenuToggles = document.querySelectorAll('.submenu-toggle');

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();

            const submenu = toggle.nextElementSibling;
            const arrow = toggle.querySelector('.arrow');

            document.querySelectorAll('.submenu.active').forEach(openSubmenu => {
                if (openSubmenu !== submenu && !openSubmenu.contains(submenu)) {
                    openSubmenu.classList.remove('active');
                    openSubmenu.previousElementSibling.querySelector('.arrow').classList.remove('rotated');

                    // Cierra los submenús de segundo nivel anidados
                    openSubmenu.querySelectorAll('.submenu-2.active').forEach(sub2 => {
                        sub2.classList.remove('active');
                        sub2.previousElementSibling.querySelector('.arrow-2').classList.remove('rotated');
                    });
                }
            });

            submenu.classList.toggle('active');
            arrow.classList.toggle('rotated');
        });
    });

    // Manejo del segundo nivel de submenú (el tercer nivel en la jerarquía)
    const submenuToggles2 = document.querySelectorAll('.submenu-toggle-2');

    submenuToggles2.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Evita que el clic se propague al padre (primer nivel)

            const submenu2 = toggle.nextElementSibling;
            const arrow2 = toggle.querySelector('.arrow-2');

            // Cierra otros submenús de segundo nivel si están abiertos
            toggle.closest('.submenu').querySelectorAll('.submenu-2.active').forEach(openSubmenu2 => {
                if (openSubmenu2 !== submenu2) {
                    openSubmenu2.classList.remove('active');
                    openSubmenu2.previousElementSibling.querySelector('.arrow-2').classList.remove('rotated');
                }
            });

            submenu2.classList.toggle('active');
            arrow2.classList.toggle('rotated');
        });
    });
});

// Agregar funcionalidad a los botones
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function () {
        // Efecto visual al hacer clic
        this.style.backgroundColor = '#831f455b';

        // Aquí puedes agregar la funcionalidad específica para cada botón
        const moduleName = this.textContent.trim();
        console.log(`Módulo accedido: ${moduleName}`);

        // Restaurar el estilo después de un breve tiempo
        setTimeout(() => {
            this.style.backgroundColor = '';
        }, 300);
    });
});