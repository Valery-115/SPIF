from django.urls import path
from . import views

urlpatterns = [
    path('captura_contrato/', views.captura_contrato, name='captura_contrato'),
    # --- Procesos dentro de 'Captura_Contrato' ---
    path('obtener_contratos/<str:numero_contrato>/', views.obtener_contratos, name='obtener_contratos'),
    path('actualizar_contrato/<str:numero_contrato>/', views.actualizar_contrato, name='actualizar_contrato'),
    path('crear_contrato/', views.crear_contrato, name='crear_contrato'),
    path('obtener_proveedores/', views.obtener_proveedores, name='obtener_proveedores'),
]