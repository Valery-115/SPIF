document.addEventListener('DOMContentLoaded', () => {
    // Definiciones de constantes y variables para el módulo principal
    const formElements = {
        contractForm: document.getElementById('contractForm'),
        contractNumberInput: document.getElementById('contractNumber'),
        allFormInputs: document.querySelectorAll('#contractForm input, #contractForm select, #contractForm textarea'),
        otherFormInputs: document.querySelectorAll('#contractForm input:not(#contractNumber), #contractForm select, #contractForm textarea'),
        btnGuardar: document.getElementById('btnGuardar'),
        btnLimpiar: document.getElementById('btnLimpiar'),
    };

    const btnAgregar = document.getElementById('btnAgregar');
    const btnActualizar = document.getElementById('btnActualizar');
    const btnImprimir = document.getElementById('btnImprimir');
    const btnAdiciones = document.getElementById('btnAdiciones');
    const btnProveedores = document.getElementById('btnProveedores');
    const proveedorModal = document.getElementById('proveedorModal');
    const btnClose = document.querySelector('.close-btn');
    const tableProveedoresContainer = document.getElementById('proveedoresTableContainer');
    const editableFields = [
        'description',
        'fund',
        'contractDate',
        'endDate',
        'status',
        'type'
    ];

    const wizardElements = {
        step1: document.getElementById('step-1'),
        step2: document.getElementById('step-2'),
        step3: document.getElementById('step-3'),
        progress: document.getElementById('progress'),
    };

    const lockableElements = [
        btnAdiciones,
        formElements.btnGuardar,
        formElements.btnLimpiar,
        btnActualizar,
    ];

    // --- MÓDULO: GESTIÓN DE UTILERIAS ---
    const utils = (() => {
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith(name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        return {
            getCookie
        };
    })();

    // --- MÓDULO: GESTIÓN DE LA INTERFAZ DE USUARIO (UI) ---
    const uiManager = (() => {
        const body = document.body;
        const toggleBtn = document.querySelector('.toggle-tab-btn');
        const notification = document.getElementById('notification');

        const setupMenuToggle = () => {
            if (!toggleBtn) return;
            const isCollapsed = body.classList.contains('collapsed');
            toggleBtn.classList.toggle('rotated', !isCollapsed);
            toggleBtn.addEventListener('click', () => {
                body.classList.toggle('collapsed');
                toggleBtn.classList.toggle('rotated');
            });
        };

        const handleSubmenuClick = (event) => {
            const toggle = event.target.closest('.submenu-toggle, .submenu-toggle-2');
            if (!toggle) return;
            event.preventDefault();
            event.stopPropagation();
            const submenu = toggle.nextElementSibling;
            const arrow = toggle.querySelector('.arrow, .arrow-2');
            const parent = toggle.closest('.submenu') || document;
            parent.querySelectorAll('.submenu.active, .submenu-2.active').forEach(openSubmenu => {
                if (openSubmenu !== submenu) {
                    openSubmenu.classList.remove('active');
                    const otherArrow = openSubmenu.previousElementSibling ? openSubmenu.previousElementSibling.querySelector('.arrow, .arrow-2') : null;
                    if (otherArrow) {
                        otherArrow.classList.remove('rotated');
                    }
                }
            });
            if (submenu) submenu.classList.toggle('active');
            if (arrow) arrow.classList.toggle('rotated');
        };

        const showNotification = (message, isSticky = false, isSuccess = false) => {
            if (!notification) {
                console.error('El elemento #notification no existe.');
                return;
            }
            notification.classList.remove('success', 'error', 'show');
            const iconClass = isSuccess ? 'check-circle' : 'exclamation-circle';
            notification.innerHTML = `<i class="fas fa-${iconClass}"></i> ${message}`;
            notification.classList.add(isSuccess ? 'success' : 'error', 'show');
            if (!isSticky) {
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        };

        return {
            init: () => {
                setupMenuToggle();
                document.body.addEventListener('click', handleSubmenuClick);
            },
            showNotification: showNotification
        };
    })();

    // --- MÓDULO: GESTIÓN DE DATOS Y FORMULARIO ---
    const formManager = ((getCookie) => {
        const lockAllFields = () => {
            formElements.allFormInputs.forEach(element => {
                element.disabled = true;
            });
            lockableElements.forEach(element => {
                if (element) {
                    element.disabled = true;
                }
            });
        };

        const lockButtons = (mode) => {
            if (mode === 'create') {
                btnActualizar.disabled = true;
                formElements.btnGuardar.disabled = false;
                formElements.btnLimpiar.disabled = false;
            } else if (mode === 'update') {
                btnActualizar.disabled = false;
                formElements.btnGuardar.disabled = true;
                formElements.btnLimpiar.disabled = true;
            } else if (mode === 'all') {
                btnActualizar.disabled = true;
                formElements.btnGuardar.disabled = true;
                formElements.btnLimpiar.disabled = true;
            }
        };

        const unlockAllFields = () => {
            formElements.allFormInputs.forEach(element => {
                if (element.id !== 'providerId' && element.id !== 'provider') {
                    element.disabled = false;
                }
            });
            lockableElements.forEach(element => {
                if (element) {
                    element.disabled = false;
                }
            });
        };

        const lockForm = (lockAll = true) => {
            if (lockAll) {
                formElements.allFormInputs.forEach(element => element.disabled = true);
            } else {
                formElements.otherFormInputs.forEach(element => element.disabled = true);
                formElements.contractNumberInput.disabled = false;
            }
        };

        const unlockEditableFields = () => {
            editableFields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) element.disabled = false;
            });
        };

        const fillFormWithData = (data) => {
            document.getElementById('providerId').value = data.providerId || '';
            document.getElementById('provider').value = data.provider || '';
            document.getElementById('description').value = data.description || '';
            document.getElementById('initialAmount').value = data.initialAmount || '';
            document.getElementById('amount').value = data.amount || '';
            document.getElementById('fund').value = data.fund || '';
            document.getElementById('contractDate').value = data.contractDate || '';
            document.getElementById('endDate').value = data.endDate || '';
            document.getElementById('status').value = data.status || '';
            document.getElementById('label').value = data.label || '';
            document.getElementById('type').value = data.type || '';
            document.getElementById('type1').value = data.type1 || '';
            document.getElementById('type2').value = data.type2 || '';
        };

        const handleContractNumberInput = async () => {
            const contractNumber = formElements.contractNumberInput.value.trim();
            if (contractNumber === '') {
                clearForm();
                lockForm(false);
                return;
            }
            try {
                const response = await fetch(`/captura_contrato/obtener_contratos/${contractNumber}/`);
                if (response.status === 404) {
                    uiManager.showNotification('No se encontró un contrato con ese número.', false, false);
                    clearForm();
                    lockForm(false);
                    return;
                }
                if (!response.ok) throw new Error(`Error en el servidor: ${response.status}`);
                const data = await response.json();
                fillFormWithData(data);
                unlockEditableFields();
                formElements.contractNumberInput.disabled = true;
                wizardManager.goToSaveStep();
            } catch (error) {
                console.error('Error al obtener los datos del contrato:', error);
                uiManager.showNotification('Ocurrió un error al buscar el contrato. Intente de nuevo.', false, false);
                clearForm();
                lockForm(false);
            }
        };

        const saveNewContract = async () => {
            const contractData = {
                contractNumber: formElements.contractNumberInput.value,
                description: document.getElementById('description').value,
                fund: document.getElementById('fund').value,
                contractDate: document.getElementById('contractDate').value,
                endDate: document.getElementById('endDate').value,
                status: document.getElementById('status').value,
                type: document.getElementById('type').value,
                providerId: document.getElementById('providerId').value,
                provider: document.getElementById('provider').value,
                initialAmount: document.getElementById('initialAmount').value,
                amount: document.getElementById('amount').value,
                label: document.getElementById('label').value,
                type1: document.getElementById('type1').value,
                type2: document.getElementById('type2').value
            };

            uiManager.showNotification('Guardando nuevo contrato...', true, false);
            try {
                const response = await fetch('/crear_contrato/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(contractData)
                });
                if (!response.ok) throw new Error(`Error en el servidor: ${response.status}`);
                const data = await response.json();
                uiManager.showNotification('¡Contrato guardado exitosamente!', false, true);
                clearForm();
                lockAllFields();
                wizardManager.resetWizard();
            } catch (error) {
                console.error('Error al guardar el nuevo contrato:', error);
                uiManager.showNotification('Ocurrió un error al guardar el nuevo contrato.', false, false);
            }
        };

        const updateExistingContract = async () => {
            const contractNumber = formElements.contractNumberInput.value.trim();
            if (!contractNumber) {
                uiManager.showNotification('Debe buscar un contrato para actualizar.', false, false);
                return;
            }
            const contractData = {
                contractNumber: contractNumber,
                description: document.getElementById('description').value,
                fund: document.getElementById('fund').value,
                contractDate: document.getElementById('contractDate').value,
                endDate: document.getElementById('endDate').value,
                status: document.getElementById('status').value,
                type: document.getElementById('type').value,
                providerId: document.getElementById('providerId').value,
                provider: document.getElementById('provider').value,
                initialAmount: document.getElementById('initialAmount').value,
                amount: document.getElementById('amount').value,
                label: document.getElementById('label').value,
                type1: document.getElementById('type1').value,
                type2: document.getElementById('type2').value
            };

            uiManager.showNotification('Guardando cambios...', true, false);

            try {
                const response = await fetch(`/actualizar_contrato/${contractNumber}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(contractData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error en el servidor: ${response.status} - ${errorText}`);
                }

                uiManager.showNotification('¡Cambios guardados exitosamente!', false, true);
                clearForm();
                lockAllFields();
                wizardManager.resetWizard();
            } catch (error) {
                console.error('Error al guardar el contrato:', error);
                uiManager.showNotification('Ocurrió un error al guardar los cambios.', false, false);
            }
        };

        const clearForm = () => {
            formElements.contractForm.reset();
        };

        return {
            lockAllFields,
            lockForm,
            lockButtons,
            unlockAllFields,
            clearForm,
            saveNewContract,
            updateExistingContract,
            handleContractNumberInput
        };
    })(utils.getCookie);

    // --- MÓDULO: GESTIÓN DEL FLUJO DE TRABAJO (WIZARD) ---
    const wizardManager = (() => {
        const updateProgress = (step) => {
            if (!wizardElements.progress) return;
            const progressPercentage = (step - 1) * 50;
            wizardElements.progress.style.width = `${progressPercentage}%`;
        };

        const updateSteps = (currentStep) => {
            [wizardElements.step1, wizardElements.step2, wizardElements.step3].forEach(step => {
                step.classList.remove('active');
            });
            if (currentStep === 1) wizardElements.step1.classList.add('active');
            if (currentStep === 2) wizardElements.step2.classList.add('active');
            if (currentStep === 3) wizardElements.step3.classList.add('active');
        };

        const startCreateMode = () => {
            formManager.clearForm();
            formManager.unlockAllFields();
            formManager.lockButtons('create');
            uiManager.showNotification('Modo de creación habilitado. Llene el formulario para continuar.', false, true);
            updateProgress(2);
            updateSteps(2);
        };

        const startUpdateMode = () => {
            formManager.clearForm();
            formManager.lockForm(false);
            formManager.lockButtons('update');
            uiManager.showNotification('Modo de actualización habilitado. Ingrese el número de contrato.', false, true);
            updateProgress(2);
            updateSteps(2);
        };

        const goToSaveStep = () => {
            updateProgress(3);
            updateSteps(3);
        };

        const resetWizard = () => {
            updateProgress(1);
            updateSteps(1);
        };

        return {
            init: resetWizard,
            startCreateMode,
            startUpdateMode,
            goToSaveStep,
            resetWizard
        };
    })();

    // --- MÓDULO: GESTIÓN DE TABLA Y API ---
    const tableManager = (() => {
        let currentPage = 0;
        const limit = 10;
        let isLoading = false;
        let hasMoreData = true;
        let currentSearchTerm = '';
        let scrollTimeout;

        const debounce = (func, delay) => {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };

        const renderTableStructure = () => {
            if (!tableProveedoresContainer) return;
            tableProveedoresContainer.innerHTML = `
                <div class="table-container">
                    <div class="table-header">
                        <div class="search-container">
                            <input type="text" id="searchInput" placeholder="Buscar por Nombre o ID del Proveedor..." class="search-input" value="${currentSearchTerm}">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Proveedor</th>
                                    <th>Proveedor</th>
                                    <th>Estatus</th>
                                    <th>Fecha Baja</th>
                                    <th>Tipo de Contrato</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            `;

            // 1. Adjuntar el evento de búsqueda
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', debounce((event) => {
                    currentSearchTerm = event.target.value.trim();
                    fetchProveedores(true);
                }, 500));
            }

            // 2. Adjuntar el evento de scroll para la carga incremental
            const tableWrapper = tableProveedoresContainer.querySelector('.table-wrapper');
            if (tableWrapper) {
                tableWrapper.addEventListener('scroll', () => {
                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        const {
                            scrollTop,
                            scrollHeight,
                            clientHeight
                        } = tableWrapper;
                        if (scrollTop + clientHeight >= scrollHeight - 200) {
                            fetchProveedores(false);
                        }
                    }, 100);
                });
            }
        };

        const appendTableRows = (proveedores, isNewSearch) => {
            const tableBody = tableProveedoresContainer.querySelector('tbody');
            if (!tableBody) return;
            if (isNewSearch) tableBody.innerHTML = '';
            if (proveedores.length === 0 && currentPage === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="no-data-cell">No se encontraron resultados.</td></tr>';
            } else {
                let rowsHTML = '';
                proveedores.forEach(proveedor => {
                    rowsHTML += `
                        <tr data-proveedor-id="${proveedor.id_proveedor}" data-proveedor-nombre="${proveedor.proveedor}">
                            <td>${proveedor.id_proveedor}</td>
                            <td>${proveedor.proveedor}</td>
                            <td>${proveedor.estatus}</td>
                            <td>${proveedor.fecha_baja}</td>
                            <td>${proveedor.tipo}</td>
                        </tr>
                    `;
                });
                tableBody.innerHTML += rowsHTML;
            }
        };

        const handleTableClick = (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.proveedorId) {
                const proveedorId = row.dataset.proveedorId;
                const proveedorNombre = row.dataset.proveedorNombre;
                document.getElementById('providerId').value = proveedorId;
                document.getElementById('provider').value = proveedorNombre;
                uiManager.showNotification(`Proveedor ${proveedorNombre} seleccionado.`, false, true);
                proveedorModal.style.display = 'none';
                tableProveedoresContainer.style.display = 'none';
            }
        };

        // NUEVA FUNCIÓN PARA RESETEAR LA TABLA Y SUS ESTADOS
        const resetTable = () => {
            currentPage = 0;
            currentSearchTerm = '';
            hasMoreData = true;
            const tableBody = tableProveedoresContainer.querySelector('tbody');
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
        };

        const fetchProveedores = async (isNewSearch = false) => {
            if (isLoading) return;
            if (isNewSearch) {
                currentPage = 0;
                hasMoreData = true;
            }
            if (!hasMoreData) return;
            isLoading = true;
            uiManager.showNotification('Cargando proveedores...', true, false);
            try {
                const offset = currentPage * limit;
                let url = `/obtener_proveedores/?offset=${offset}&limit=${limit}`;
                if (currentSearchTerm) {
                    url += `&search=${encodeURIComponent(currentSearchTerm)}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error en el servidor: ${response.status}`);
                const data = await response.json();
                const proveedores = data.datos;
                hasMoreData = data.has_more;
                appendTableRows(proveedores, isNewSearch);
                currentPage++;
                uiManager.showNotification('¡Tabla de proveedores actualizada!', false, true);
            } catch (error) {
                console.error('Error al obtener los proveedores:', error);
                uiManager.showNotification('Ocurrió un error al cargar los proveedores.', false, false);
            } finally {
                isLoading = false;
            }
        };

        return {
            renderTableStructure,
            fetchProveedores,
            handleTableClick,
            resetTable,
        };
    })();

    // --- MANEJO DE EVENTOS INICIALES ---
    formElements.contractNumberInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            formManager.handleContractNumberInput();
        }
    });

    if (btnAgregar) {
        btnAgregar.addEventListener('click', (event) => {
            event.preventDefault();
            wizardManager.startCreateMode();
        });
    }

    if (formElements.btnGuardar) {
        formElements.btnGuardar.addEventListener('click', (event) => {
            event.preventDefault();
            formManager.saveNewContract();
        });
    }

    if (btnActualizar) {
        btnActualizar.addEventListener('click', (event) => {
            event.preventDefault();
            formManager.updateExistingContract();
        });
    }

    if (formElements.btnLimpiar) {
        formElements.btnLimpiar.addEventListener('click', (event) => {
            event.preventDefault();
            formManager.clearForm();
        });
    }

    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }

    // Evento para mostrar el modal de proveedores
    if (btnProveedores) {
        btnProveedores.addEventListener('click', async (event) => {
            event.preventDefault();
            // Llama a la función de reseteo antes de mostrar el Modal
            tableManager.resetTable();

            //Muestra el Modal y el contenedor de la Tabla_Proveedores
            proveedorModal.style.display = 'flex';
            tableProveedoresContainer.style.display = 'block';

            //Re-renderiza la estructura de la tabla (IMPORTANTE)
            tableManager.renderTableStructure();

            /*Llama a la función para cargar a los proveedores,
                indicando que es una nueva búsqueda. */
            tableManager.fetchProveedores(true);
        });
    }

    // Eventos para ocultar el modal
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            proveedorModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === proveedorModal) {
                proveedorModal.style.display = 'none';
            }
        });
    }

    if (btnAdiciones) {
        btnAdiciones.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Funcionalidad de "Adiciones" en desarrollo. Se abrirá un nuevo formulario para registrar una adición al contrato.');
        });
    }

    // Delegación de eventos para la tabla de proveedores
    tableProveedoresContainer.addEventListener('click', tableManager.handleTableClick);

    // Inicializar los módulos
    uiManager.init();
    wizardManager.init();
    formManager.lockAllFields();
});