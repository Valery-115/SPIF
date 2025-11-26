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
    tipo = models.TextField(
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
    
    #Para definir la vista en como se vera en Admin es en admin.py
    def __str__(self):
        return f'Contrato {self.numero_contrato}'

#Modelo para representar a los Proveedores
class Proveedor(models.Model):
    id_proveedor = models.DecimalField(
        primary_key=True,
        max_digits=15,
        decimal_places=0,
        verbose_name="ID Proveedor"
    )
    
    num_empleado = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True
    )
    
    proveedor = models.CharField(
        max_length=100,
        null=True, 
        verbose_name="Nombre Proveedor"
    )
    
    nombre_comercial = models.CharField(
        max_length=100,
        null=True
    )
    
    rfc_prueba = models.CharField(
        max_length=20,
        null=True
    )
    
    # El campo "Tipo" también usa un menú de opciones
    TIPO_CHOICES = (
        ('', ''),
        ('BECARIO', 'BECARIO'),
        ('CONTRATISTA','CONTRATISTA'),
        ('DAP','DAP'),
        ('EMPLEADO','EMPLEADO'),
        ('ORGANISMOS','ORGANISMOS'),
        ('PAGO PASIVO','PAGO PASIVO'),
        ('PAGO UNICO','PAGO UNICO'),
        ('PROVEEDORES','PROVEEDORES'),
        ('SEGURO VIDA','SEGURO VIDA'),
    )
    
    tipo = models.TextField(
        max_length=50, 
        choices=TIPO_CHOICES,
        default=' ',
        null=True,
        verbose_name="Tipo Proveedor",
    )
    
    forma_pago = models.IntegerField(
        null=True
    )
    
    banco = models.IntegerField(
        null=True
    )
    
    banco_cuenta = models.CharField(
        max_length=20,
        null=True
    )
    
    banco_tipo_cuenta = models.CharField(
        max_length=20,
        null=True
    )
    
    fecha_alta = models.DateTimeField(
        max_length=23,
        #temporal
        null=True
    )
    
    usuario_alta = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        #temporal
        null=True
    )
    
    fecha_modificacion = models.DateTimeField(
        max_length=23,
        #temporal
        null=True
    )
    
    usuario_modificacion = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        #temporal
        null=True
    )
    
    # Elecciones basadas en tus "Menú de Opciones" y "Status"
    ESTATUS_CHOISES = (
        ('A', 'A'),
        ('C', 'C')
    )
    
    estatus = models.CharField(
        max_length=1, 
        choices=ESTATUS_CHOISES, 
        default='A',
        verbose_name="Estatus"
    )
    
    fecha_estatus = models.DateTimeField(
        max_length=23,
        #temporal
        null=True
    )
    
    cuenta_pago = models.IntegerField(
        #temporal
        null=True
    )
    
    domicilio = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )
    
    domicilio_2 = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )
    
    colonia = models.CharField(
        max_length=100,
        null=True
    )
    
    observaciones = models.CharField(
        max_length=100,
        null=True
    )
    
    ciudad = models.CharField(
        max_length=50,
        null=True
    )
    
    estado = models.CharField(
        max_length=50,
        null=True
    )
    
    zip = models.CharField(
        max_length=20,
        null=True
    )
    
    pais = models.CharField(
        max_length=50,
        null=True
    )
    
    area = models.CharField(
        max_length=10,
        null = True
    )
    
    telefono = models.CharField(
        max_length=50,
        null=True
    )
    
    area_fax = models.CharField(
        max_length=10,
        null=True
    )
    
    fax = models.CharField(
        max_length=50,
        null=True
    )
    
    telefono_2 = models.CharField(
        max_length=50,
        null=True
    )
    
    email = models.CharField(
        max_length=100,
        null = True
    )
    
    temporal = models.CharField(
        max_length=1,
        null=True
    )
    
    fecha_baja = models.DateTimeField(
        max_length=23,
        null=True, 
        blank=True, 
        verbose_name="Fecha Baja"
    )
    
    tipo_prov = models.CharField(
        max_length=15,
        null=True
    )
    
    monto_pu = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True
    )
    
    motivo_pu = models.TextField(
        null=True
    )
    
    renovacion = models.DateTimeField(
        max_length=23,
        null=True
    )
    
    inscripcion = models.DateTimeField(
        max_length=23,
        #temporal
        null=True
    )
    
    solicito_pu = models.CharField(
        max_length=25,
        null=True
    )
    
    periodo_pu = models.CharField(
        max_length=15,
        null=True
    )
    
    up = models.CharField(
        max_length=6,
        null=True
    )
    
    autorizado = models.CharField(
        max_length=35,
        null=True
    )
    
    curp = models.CharField(
        max_length=20,
        null=True
    )
    
    captura = models.CharField(
        max_length=1,
        #temporal
        null=True
    )
    
    solicitar = models.CharField(
        max_length=1,
        null=True
    )
    
    cat = models.DecimalField(
        max_digits=3,
        decimal_places=0,
        #temporal
        null=True
    )
    
    subcat = models.CharField(
        max_length=10,
        null=True
    )
    
    f_activacion = models.DateTimeField(
        max_length=23,
        #temporal
        null=True
    )
    
    rep_legal = models.CharField(
        max_length=100,
        #temporal
        null=True
    )
    
    persona = models.CharField(
        max_length=10,
        #temporal
        null=True
    )
    
    tipo_alta = models.CharField(
        max_length=15,
        #temporal
        null=True
    )
    
    num_ext = models.CharField(
        max_length=10,
        null=True
    )
    
    num_int = models.CharField(
        max_length=10,
        null=True
    )
    
    calle_notif = models.CharField(
        max_length=100,
        null=True
    )
    
    next_notif = models.CharField(
        max_length=10,
        null=True
    )
    
    nint_notif = models.CharField(
        max_length=10,
        null=True
    )
    
    colonia_notif = models.CharField(
        max_length=50,
        null=True
    )
    
    ciudad_notif = models.CharField(
        max_length=50,
        null=True
    )
    
    pais_notif = models.CharField(
        max_length=50,
        null=True
    )
    
    zip_notif = models.CharField(
        max_length=52,
        null=True
    )
    
    observaciones2 = models.TextField(
        null=True
    )
    
    #Para definir la vista en como se vera en Admin es en admin.py
    def __str__(self):
        return f'Proveedor {self.id_proveedor} - {self.proveedor}'