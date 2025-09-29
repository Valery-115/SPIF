document.addEventListener('DOMContentLoaded', () => {
    // Definiciones de constantes y variables globales para el módulo principal
    const formElements = {
        contractForm: document.getElementById('contractForm'),
        contractNumberInput: document.getElementById('contractNumber'),
        otherFormInputs: document.querySelectorAll('#contractForm input:not(#contractNumber), #contractForm select, #contractForm textarea'),
    };
    const btnProveedores = document.getElementById('btnProveedores');
    const tableProveedoresContainer = document.getElementById('proveedoresTableContainer');
    const editableFields = [
        'description',
        'fund',
        'contractDate',
        'endDate',
        'status',
        'type'
    ];
    let currentPage = 0;
    const limit = 10;
    let isLoading = false;
    let hasMoreData = true;
    let currentSearchTerm = '';
    let scrollTimeout;

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
    // (Notificaciones, Menús, etc...)
    const uiManager = (() => {
        const body = document.body;
        const toggleBtn = document.querySelector('.toggle-tab-btn');
        const notification = document.getElementById('notification');

        // Configuración de 'Alternar menú de configuración' 
        const setupMenuToggle = () => {
            if (!toggleBtn) return;
            const isCollapsed = body.classList.contains('collapsed');
            toggleBtn.classList.toggle('rotated', !isCollapsed);
            toggleBtn.addEventListener('click', () => {
                body.classList.toggle('collapsed');
                toggleBtn.classList.toggle('rotated');
            });
        };

        // Manejo de los click en el 'Submenu'
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

        //Ver notificaciones
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

    uiManager.init();

    // --- MÓDULO: GESTIÓN DE DATOS Y FORMULARIO ---
    // (Llenado de form 'Contratos')
    const formManager = ((getCookie) => {
        const lockForm = () => {
            formElements.otherFormInputs.forEach(element => {
                element.disabled = true;
            });
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

        const clearForm = () => {
            formElements.contractForm.reset();
        };

        const saveContract = async () => {
            const contractNumber = formElements.contractNumberInput.value.trim();
            if (!contractNumber) {
                uiManager.showNotification('Debe buscar un contrato antes de guardar los cambios.', false, false);
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
                const response = await fetch(`/SPIF/actualizar_contrato/${contractNumber}/`, {
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
                lockForm();
            } catch (error) {
                console.error('Error al guardar el contrato:', error);
                uiManager.showNotification('Ocurrió un error al guardar los cambios.', false, false);
            }
        };


        const handleContractNumberInput = async () => {
            const contractNumber = formElements.contractNumberInput.value.trim();
            if (contractNumber === '') {
                clearForm();
                lockForm();
                return;
            }
            try {
                const response = await fetch(`/SPIF/obtener_contratos/${contractNumber}/`);
                if (response.status === 404) {
                    uiManager.showNotification('No se encontró un contrato con ese número.', false, false);
                    clearForm();
                    lockForm();
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }
                const data = await response.json();
                fillFormWithData(data);
                unlockEditableFields();
            } catch (error) {
                console.error('Error al obtener los datos del contrato:', error);
                uiManager.showNotification('Ocurrió un error al buscar el contrato. Intente de nuevo.', false, false);
                clearForm();
                lockForm();
            }
        };

        return {
            lockForm,
            clearForm,
            saveContract,
            handleContractNumberInput
        };
    })(utils.getCookie);

    // --- MÓDULO: GESTIÓN DE TABLA Y API ---
    // (Obtención de datos de 'Proveedores')
    const tableManager = (() => {
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
                        <h2 class="section-title"><i class="fas fa-truck"></i> Listado de Proveedores</h2>
                        <div class="search-container">
                            <input type="text" id="searchInput" placeholder="Buscar por Proveedor o ID..." class="search-input" value="${currentSearchTerm}">
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
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', debounce((event) => {
                    currentSearchTerm = event.target.value.trim();
                    fetchProveedores(true);
                }, 500));
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
                tableProveedoresContainer.style.display = 'none';
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
                let url = `SPIF/obtener_proveedores/?offset=${offset}&limit=${limit}`;
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
            handleTableClick
        };
    })();

    // --- MANEJO DE EVENTOS INICIALES ---
    const btnPrimary = document.getElementById('btn-primary');
    const btnGrabar = document.getElementById('btnGrabar');
    const btnImprimir = document.getElementById('btnImprimir');


    formElements.contractNumberInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            formManager.handleContractNumberInput();
        }
    });

    if (btnProveedores) {
        btnProveedores.addEventListener('click', async (event) => {
            event.preventDefault();
            tableProveedoresContainer.style.display = 'block';
            currentSearchTerm = '';
            tableManager.renderTableStructure();
            tableManager.fetchProveedores(true);
        });
    }

    if (btnPrimary) {
        btnPrimary.addEventListener('click', (event) => {
            event.preventDefault();
            formManager.saveContract();
        });
    }

    if (btnGrabar) {
        btnGrabar.addEventListener('click', (event) => {
            event.preventDefault();
            formManager.saveContract();
        });
    }

    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }

    tableProveedoresContainer.addEventListener('click', tableManager.handleTableClick);

    // NUEVO CÓDIGO: Observador de mutación para adjuntar el evento de scroll.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                const tableWrapper = document.querySelector('.table-wrapper');
                if (tableWrapper && !tableWrapper.dataset.listenerAttached) {
                    tableWrapper.addEventListener('scroll', () => {
                        if (scrollTimeout) clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            const {
                                scrollTop,
                                scrollHeight,
                                clientHeight
                            } = tableWrapper;
                            if (scrollTop + clientHeight >= scrollHeight - 200) {
                                tableManager.fetchProveedores(false);
                            }
                        }, 100);
                    });
                    tableWrapper.dataset.listenerAttached = 'true';
                }
            }
        });
    });

    observer.observe(tableProveedoresContainer, {
        childList: true
    });
    formManager.lockForm();
});