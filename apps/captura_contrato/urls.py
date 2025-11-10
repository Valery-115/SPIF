from django.urls import path
from . import views
from .views import *

urlpatterns = [
    # El '.as_view', hace que Django llame el método correcto de la clase (ContratoListView)
    path('', pestaña_captura_contratos.as_view(), name = 'captura_contrato'),
    # --- Procesos dentro de 'Captura_Contrato' ---
    path('buscar_contrato/<str:numero_contrato>/', buscar_contrato.as_view(), name='buscar_contratos'),
    path('actualizar_contrato/', views.update_contrato.as_view(), name='update_contrato'),
    path('crear_contrato/', views.crear_contrato, name='crear_contrato'),
    path('obtener_proveedores/', views.obtener_proveedores, name='obtener_proveedores'),
]