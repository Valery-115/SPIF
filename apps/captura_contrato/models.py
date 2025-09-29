from django.db import models

# Create your models here.

# Este modelo creará una tabla llamada "Contrato" en la base de datos.
class Contrato(models.Model): #Modelo para gestionar contratos con proveedores
    # Cada campo (Field) se convierte en una columna de la tabla.
    numero_contrato = models.CharField(
        primary_key=True,
        max_length=20, 
        verbose_name="Número de Contrato"
    )
    
    id_proveedor = models.ForeignKey(
        'Proveedor',
        on_delete=models.CASCADE, #Revirar lo de cascada para saber como funciona
        default=0,
        related_name="Contratos_ID",
        verbose_name="ID_proveedor"
    )
    
    proveedor = models.ForeignKey(
        'Proveedor',
        on_delete=models.CASCADE,
        default='Shoto',
        max_length=200, 
        related_name='Contratos_name_Prov',
        verbose_name="f-Nombre del Proveedor"
        )
    
    descripcion = models.TextField(
        verbose_name="Descripción"
        )
    
    monto_inicial = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name="Monto Inicial"
        )
    
    importe = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name="Importe Total"
        )
    
    FONDO_CHOISE = (
        ('MHA','MHA'),
        ('Genshin', 'Genshin')
    )
    
    fondo = models.CharField(
        max_length=50,
        choices=FONDO_CHOISE,
        default='MHA',
        verbose_name='Fondo'
    )
    
    fecha_contrato = models.DateField(
        verbose_name="Fecha de Contrato"
        )
    
    fecha_terminacion = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Fecha de Terminacion"
        )
    
    # Elecciones basadas en tus "Menú de Opciones" y "Status"
    STATUS_CHOICES = (
        ('Activo', 'Activo'),
        ('Terminado', 'Terminado'),
        ('Cancelado', 'Cancelado'),
        ('En proceso', 'En Proceso'),
    )
    
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='Activo',
        verbose_name="Estado"
    )

    # El campo "Label" puede ser un CharField simple
    label = models.IntegerField(
        default=000, 
        verbose_name="Etiqueta"
    )
    
    # El campo "Tipo" también usa un menú de opciones
    TIPO_CHOICES = (
        ('Servicio', 'Servicio'),
        ('Producto', 'Producto'),
        ('Licencia', 'Licencia'),
        ('Mantenimiento', 'Mantenimiento'),
    )
    tipo = models.CharField(
        max_length=50, 
        choices=TIPO_CHOICES,
        default='Servicio',
        verbose_name="Tipo de Contrato"
    )
    
    tipo_1 = models.CharField(
        max_length=50,
        choices=TIPO_CHOICES,
        default='Servicio',
        verbose_name="Tipo_1"
    )
    
    tipo_2 = models.CharField(
        max_length=50,
        choices=TIPO_CHOICES,
        default='Servicio',
        verbose_name="Tipo_2"
    )
    
    #Es para definir la vista en como se vera en Admin
    #Pero es mejor difinirlo en admin.py
    def __str__(self):
        return f'Contrato {self.numero_contrato} - {self.proveedor}'

#Modelo para representar a los Proveedores
class Proveedor(models.Model):
    id_proveedor = models.IntegerField(
        primary_key=True,
        verbose_name="ID Proveedor"
    )
    
    proveedor = models.CharField(
        max_length=200, 
        verbose_name="Nombre Proveedor"
    )
    
    # Elecciones basadas en tus "Menú de Opciones" y "Status"
    ESTATUS_CHOISES = (
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    )
    
    estatus = models.CharField(
        max_length=50, 
        choices=ESTATUS_CHOISES, 
        default='A',
        verbose_name="Estatus"
    )
    
    fecha_baja = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Fecha Baja"
        )
    
    # El campo "Tipo" también usa un menú de opciones
    TIPO_CHOICES = (
        ('Gasto Corriente', 'Gasto Corriente'),
        ('Proyecto', 'Proyecto'),
    )
    
    tipo = models.CharField(
        max_length=50, 
        choices=TIPO_CHOICES,
        default='Gato Corriente',
        verbose_name="Tipo de Contrato"
    )
    
    #Es para definir la vista en como se vera en Admin
    #Pero es mejor difinirlo en admin.py
    def __str__(self):
        return f'Proveedor {self.id_proveedor} - {self.proveedor}'