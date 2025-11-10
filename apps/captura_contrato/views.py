from django.shortcuts import redirect
from django.contrib.auth import logout
from .models import Contrato, Proveedor
# Son los métodos HTTP (Get, Post, Put) que maneja Django
from django.views import View
from django.views.generic import *
from django.http import JsonResponse
import json
from django.db.models import Q # Importamos 'Q' para búsquedas complejas



# Create your views here.
# --- Pestalla Web (Login) ---
def user_logout(request):
    logout(request)
    return redirect('login')

# --- Carga la pestaña captura_contratos --- (Para cargar el template al ingresar en la URL)
class pestaña_captura_contratos(TemplateView):
    # Para indicar, que si se entra a esta clase en el URL, cargue está plantilla
    template_name = 'captura_contrato.html'
    
# --- Busca el contrato especifico para actualizar los datos ---
class buscar_contrato(View):
    # El metodo get 'conseguir' es el mejor método para la búsqueda
    # EL 'número_contrato' viene de la URL
    def get(self, request, numero_contrato):

        try:
            # Django para el número del contrato de la URL, here
            contrato = Contrato.objects.get(numero_contrato=numero_contrato)
            
            #Aqui 'mapeamos' (correspondencia ente FrontEnd y BackEnd) los nombres
            #de los campos del modelo a los IDs de los inputs HTML
            datos_contrato = {
                'providerId': contrato.id_proveedor.id_proveedor,
                'provider': contrato.proveedor.proveedor,
                'description': contrato.descripcion,
                'initialAmount': contrato.monto_inicial,
                'amount': contrato.importe,
                'fund': contrato.fondo,
                'contractDate': contrato.fecha_contrato,
                'endDate': contrato.fecha_terminacion,
                'status': contrato.status,
                'label': contrato.label,
                'type': contrato.tipo,
                'type1': contrato.tipo_1,
                'type2': contrato.tipo_2,
            }
            #Devolvemos los datos como una respuesta 'JSON' {Se usa para el almacenamiento y trasferencia de datos,
            # principalmente entre un servidor (backend) y un cliente (frontend).}
            return JsonResponse(datos_contrato, status=200)
        
        except Contrato.DoesNotExist:
            return JsonResponse({'Error:':'Contrato no registrado en la BD.'}, status=404)
        except Exception:
            return JsonResponse({'Error:':'Error Interno!'}, status=500)

# ---actualiza los contratos --- (dinamico)
class update_contrato(View):
    
    # Método CRUD para actualizar datos 'PUT'
    def put(self, request, *args, **kwargs):
        try:
            # 1. Obtener los datos del JSON (Decodifica)
            data = json.loads(request.body)
            
            # 2. Obtener el identificador del Contrato y del Proveedor desde los datos JSON
            numero_contrato = data.get('contractNumber')
            id_proveedor = data.get('providerId')
            
            if not numero_contrato:
                # Error si no se encuentra el contrato a update (400 = Petición del usuario invalida)
                return JsonResponse({'Error:':'Ingrese el número de contrato para la búsqueda, por favor.'}, status = 400)
            
            # 3. Buscar el contrato existente y el proveedor
            contrato = Contrato.objects.get(numero_contrato=numero_contrato)
            proveedor_obj = Proveedor.objects.get(id_proveedor=id_proveedor)
            
            # 4. Asignar llaver foraneas y campos (Update controlada)  
            # Asigna el objeto Proveedor a la clave foránea
            contrato.id_proveedor = proveedor_obj
            contrato.proveedor = proveedor_obj
                
            # Actualizar los campos del modelo con los datos recibidos (Solo se actualizan los de la lista)
            contrato.descripcion = data.get('description', contrato.descripcion)
            contrato.fondo = data.get('fund', contrato.fondo)
            contrato.fecha_contrato = data.get('contractDate', contrato.fecha_contrato)
            contrato.fecha_terminacion = data.get('endDate', contrato.fecha_terminacion)
            contrato.status = data.get('status', contrato.status)
            contrato.tipo = data.get('type', contrato.tipo)
                
            # 5. Guardar los cambios en la base de datos
            contrato.save()
                
            # 6. Devolver una respuesta exitosa
            return JsonResponse({'Mensaje de Exito': 'Contrato actualizado exitosamente'}, status=200)
        
            # 7. Manejo de errores (404: Error de BD, 400: Error al validar JSON o los datos enviados)
        except Contrato.DoesNotExist:
            return JsonResponse({'Error': f'Contrato No.{numero_contrato} no encontrado'}, status=404)
        except Proveedor.DoesNotExist:
            return JsonResponse({'Error': f'Proveedor con el ID{id_proveedor} no encontrado'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'Error': f'Trasformación de datos a JSON invalido.'}, status = 400)
        except Exception as e:
            return JsonResponse({'Error': f'Error interno del servidor : {str(e)}'}, status=500)
            
# --- Crear un nuevo contrato ---
def crear_contrato(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            #Validar que el proveedor exista
            id_proveedor = data.get('providerId')
            proveedor_obj = Proveedor.objects.get(id_proveedor=id_proveedor)
            
            #Crear la instancia/objeto del modelo New Contract
            nuevo_contrato = Contrato(
                numero_contrato = data.get('contractNumber'),
                id_proveedor = proveedor_obj, #Asigna el objeto Proveedor, no solo el ID
                descripcion = data.get('description'),
                monto_inicial = data.get('initialAmount'),
                importe = data.get('amount'),
                fondo = data.get('fund'),
                fecha_contrato = data.get('contractDate'),
                fecha_terminacion = data.get('endDate'),
                status = data.get('status'),
                label = data.get('label'),
                tipo = data.get('type'),
                tipo_1 = data.get('type1'),
                tipo_2 = data.get('type2')
            )
            
            #Guardar en la BD
            nuevo_contrato.save()
            return JsonResponse({'message' : 'Contrato creado exitosamente'}, status=201)
        
        except Proveedor.DoesNotExist:
            return JsonResponse({'message' : 'Proveedor no encontrado'}, status=400)
        except Exception as e:
            #Camputa de cualquier otro error, como datos faltantes
                #Vuelve el error legible
            return JsonResponse({'error' : str(e)}, status=400)
        
    return JsonResponse({'error' : 'Método no permitido'}, status=405)
        

# --- Tabla dinamica de Proveedores ---
#View de Query en la BD (PROVEEDORES)
def obtener_proveedores(request):
    try:
        # Obtener los parámetros de paginación y búsqueda
        # Si no se proveen, se usan valores por defecto para una carga controlada.
        limit = int(request.GET.get('limit', 10))
        offset = int(request.GET.get('offset', 0))
        search_term = request.GET.get('search', '').strip()

    except (ValueError, TypeError):
        return JsonResponse({"error": "Parámetros de paginación inválidos."}, status=400)
    
    # Construir el QuerySet base para todos los proveedores
    proveedores_query = Proveedor.objects.all()

    # Aplicar el filtro de búsqueda si existe un término
    if search_term:
        proveedores_query = proveedores_query.filter(
            Q(id_proveedor__icontains=search_term) | Q(proveedor__icontains=search_term)
        )
    
    # Ordenar los datos para garantizar un orden consistente en la paginación
    proveedores_query = proveedores_query.order_by('id_proveedor')

    # Aplicar la paginación para obtener solo un subconjunto de los datos
    total_proveedores = proveedores_query.count()
    proveedores_paginados = proveedores_query[offset:offset + limit]

    # Convertir el QuerySet paginado a una lista de diccionarios
    lista_datos = list(proveedores_paginados.values('id_proveedor', 'proveedor', 'estatus', 'fecha_baja', 'tipo'))
    
    # Determinar si hay más datos disponibles para la siguiente página
    has_more = total_proveedores > (offset + limit)

    return JsonResponse({
        'datos': lista_datos,
        'has_more': has_more
    })