from django.shortcuts import render, redirect
from django.contrib.auth import logout
from .models import Contrato, Proveedor
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Q # Importamos 'Q' para búsquedas complejas

# Create your views here.
# --- Pestalla Web (Login) ---
def user_logout(request):
    logout(request)
    return redirect('login')

# --- Pestalla Web ---
#Para la BD {rendereiza la plantilla}
def captura_contrato(request):
    #1. Obtiene todos los contratos de la base de datos
    contratos = Contrato.objects.all().select_related('contrato')
    
    #2. Prepara los datos para enviarlos a la Plantilla
    contexto = {
        'contratos': contratos
    }
    
    #3. Renderiza la plantilla HTML y le pasa los datos (captura_contrato)
    return render(request, 'captura_contrato.html', contexto)
# --- HACER QUE 'CAMBIOS' FUNCIONE. ---

# --- Muestra los Contratos ---
#View de Query en la BD (CONTRATOS)
def obtener_contratos(request, numero_contrato):
    #Usamos get_object_or_404 para buscar el objeto. Si no lo encuentra,
    #automáticamente devuelve una respuesta HTTP 404.
    try:
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
        #Si no se encuentra el contrato, devolvemos un respuesta de error 404.
        return HttpResponse(status=404)

# ---actualiza los contratos --- (dinamico)
@csrf_exempt  # <-- IMPORTANTE: Esto es necesario para peticiones PUT o POST que no sean de un formulario de Django.
def actualizar_contrato(request, numero_contrato):
    if request.method == 'PUT':
        try:
            # 1. Obtener los datos del JSON
            data = json.loads(request.body)
            
            # 2. Buscar el objeto Contrato por su número
            # (Aquí debes usar tu modelo de Django)
            contrato = Contrato.objects.get(numero_contrato=numero_contrato)
            
            # 3. Obtiene el ID del proveedor desde los datos del JSON
            id_proveedor = data.get('providerId')
            
            # 4. Busca el objeto Proveedor
            # Si no se encuentra, Django lanzará una excepción 'DoesNotExist'
            proveedor_obj = Proveedor.objects.get(id_proveedor=id_proveedor)
            
            # 5. Asigna el objeto Proveedor a la clave foránea
            contrato.id_proveedor = proveedor_obj
            contrato.proveedor = proveedor_obj
            
            # 6. Actualizar los campos del modelo con los datos recibidos
            contrato.descripcion = data.get('description')
            contrato.fondo = data.get('fund')
            contrato.fecha_contrato = data.get('contractDate')
            contrato.fecha_terminacion = data.get('endDate')
            contrato.status = data.get('status')
            contrato.tipo = data.get('type')
            
            # 7. Guardar los cambios en la base de datos
            contrato.save()
            
            # 8. Devolver una respuesta exitosa
            return JsonResponse({'message': 'Contrato actualizado exitosamente'}, status=200)
        except Contrato.DoesNotExist:
            return JsonResponse({'error': 'Contrato no encontrado'}, status=404)
        except Proveedor.DoesNotExist:
            return JsonResponse({'error': 'Proveedor no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        
    return JsonResponse({'error': 'Método no permitido'}, status=405)

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