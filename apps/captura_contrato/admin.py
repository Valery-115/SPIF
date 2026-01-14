from django.contrib import admin

from .models import Contrato, Proveedor

#Basic
#admin.site.register(Contrato)
#Personalizada
#@admin.register(Contrato)
#class ContratoAdmin(admin.ModelAdmin):
    #Definir que columnas son visibles en la BD de Admin.
    #list_display=['numero_contrato', 'id_proveedor']

#Basic
#admin.site.register(Proveedor)
#Personalizada
#@admin.register(Proveedor)
#class ProveedorAdmin(admin.ModelAdmin):
    #Definir que columnas son visibles en la BD de Admin.
    #list_display=['id_proveedor', 'nombre_proveedor', 'fecha_baja']