# core/views.py

# --- Imports de Django y DRF ---
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.serializers.json import DjangoJSONEncoder
import datetime
from datetime import timedelta
import json
import random
from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# --- Imports de tu aplicación ---
from .models import Pozo, Medicion, Alerta 
from .forms import PozoForm, CustomUserCreationForm
# Necesitarás crear este archivo 'serializers.py' si usas la APIView
# from .serializers import MedicionSerializer 


#===============================================================
# VISTAS DE PÁGINAS Y AUTENTICACIÓN
#===============================================================

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                # Redirige a 'menu' si el login es exitoso
                return redirect('menu') 
    else:
        form = AuthenticationForm()
    
    return render(request, 'core/login.html', {'form': form})

@login_required
def menu_view(request):
    return render(request, 'core/menu.html')

def home_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login') 

@login_required
def dashboard_view(request):
    pozos_usuario = Pozo.objects.filter(propietario=request.user)

    # Prepara los datos del pozo para ser consumidos por JavaScript (incluyendo lat/long)
    pozos_list_json = list(pozos_usuario.values('id', 'nombre', 'ubicacion', 'latitud', 'longitud'))

    context = {
        'pozos': pozos_usuario,
        'pozos_json': json.dumps(pozos_list_json, cls=DjangoJSONEncoder)
    }
    
    return render(request, 'core/dashboard.html', context)

@login_required
def reportes_view(request):
    pozos_usuario = Pozo.objects.filter(propietario=request.user)
    mediciones = Medicion.objects.filter(pozo__in=pozos_usuario)

    # Lógica de Filtros
    pozo_id = request.GET.get('pozo')
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')

    if pozo_id:
        mediciones = mediciones.filter(pozo_id=pozo_id)
    if fecha_inicio:
        mediciones = mediciones.filter(fecha_hora__gte=fecha_inicio)
    if fecha_fin:
        # Optimización del filtro: si el usuario pone '2025-10-30', queremos incluir todo ese día.
        try:
            fecha_fin_dt = datetime.datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            mediciones = mediciones.filter(fecha_hora__date__lte=fecha_fin_dt)
        except ValueError:
             # Manejar error si el formato de fecha es incorrecto
            pass


    context = {
        'pozos': pozos_usuario,
        # Consulta eficiente usando la ordenación inversa por defecto del modelo
        'mediciones': mediciones.all() 
    }
    return render(request, 'core/reportes.html', context)


def registro_view(request):
    if request.user.is_authenticated:
        return redirect('menu')

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) 
            return redirect('menu')
    else:
        form = CustomUserCreationForm()
        
    return render(request, 'core/registro.html', {'form': form})

@login_required
def crear_pozo_view(request):
    if request.method == 'POST':
        form = PozoForm(request.POST)
        if form.is_valid():
            pozo = form.save(commit=False)
            pozo.propietario = request.user
            pozo.save()
            return redirect('dashboard')
    else:
        form = PozoForm()
    return render(request, 'core/crear_pozo.html', {'form': form})

#===============================================================
# VISTAS DE API (PARA JAVASCRIPT Y SENSORES)
#===============================================================

@login_required
def get_pozo_data(request, pozo_id):
    """
    Simula la ingesta de datos, genera alertas (CRÍTICO) y devuelve los datos para el dashboard.
    """
    try:
        pozo = Pozo.objects.get(id=pozo_id, propietario=request.user)

        # --- INICIO DE LA SIMULACIÓN AUTOMÁTICA ---
        
        ultima_medicion = Medicion.objects.filter(pozo=pozo).first() # Usa .first() gracias al ordering de Meta
        
        base_nivel = Decimal('20.0') 
        if ultima_medicion:
            base_nivel = ultima_medicion.nivel_agua

        # Generar una pequeña variación aleatoria
        fluctuacion = Decimal(random.uniform(-0.5, 0.4))
        nuevo_nivel = base_nivel + fluctuacion
        
        # Asegurarse de que el nivel se mantenga en un rango lógico
        if nuevo_nivel < 3: nuevo_nivel = Decimal('3.0')
        if nuevo_nivel > 25: nuevo_nivel = Decimal('25.0')

        # Determinar el estado
        nuevo_estado = 'Operativo'
        if nuevo_nivel < 7:
            nuevo_estado = 'Crítico'
        elif nuevo_nivel < 15:
            nuevo_estado = 'Alerta'

        # Crear y guardar la nueva medición
        Medicion.objects.create(
            pozo=pozo,
            nivel_agua=nuevo_nivel,
            estado_sensor=nuevo_estado
        )
        
        # --- LÓGICA DE ALERTA (CORRECCIÓN CRÍTICA) ---
        if nuevo_estado == 'Crítico':
            # Verifica si ya existe una alerta CRÍTICA reciente no leída (ej. en las últimas 2 horas)
            umbral_alerta = datetime.datetime.now() - timedelta(hours=2)
            alerta_existente = Alerta.objects.filter(
                pozo=pozo, 
                leida=False, 
                descripcion__contains='CRÍTICO', 
                fecha_hora__gte=umbral_alerta
            ).exists()
            
            if not alerta_existente:
                Alerta.objects.create(
                    pozo=pozo,
                    descripcion=f"¡Nivel de agua CRÍTICO detectado ({nuevo_nivel})!",
                    propietario=request.user,
                )
        # --- FIN LÓGICA DE ALERTA ---

        # Optimización de Consulta: Obtener las últimas 50 mediciones (ya ordenadas por tiempo descendente)
        mediciones_queryset = pozo.mediciones.all()[:50]
        
        # Revertir la lista para que los datos en JSON vayan de antiguo a nuevo (para el gráfico)
        mediciones = list(mediciones_queryset)[::-1]
        
        data = {
            'labels': [m.fecha_hora.strftime('%H:%M:%S') for m in mediciones],
            'niveles': [m.nivel_agua for m in mediciones],
            'estados': [m.estado_sensor for m in mediciones] 
        }
        return JsonResponse(data)
        
    except Pozo.DoesNotExist:
        return JsonResponse({'error': 'Pozo no encontrado'}, status=404)

@login_required
def get_alertas(request):
    """Devuelve las alertas no leídas del usuario actual para el dashboard."""
    alertas = Alerta.objects.filter(propietario=request.user, leida=False).order_by('-fecha_hora')
    data = {
        'alertas': list(alertas.values('id', 'descripcion', 'fecha_hora', 'pozo__nombre'))
    }
    return JsonResponse(data)

# Nota: Debes definir MedicionSerializer en serializers.py para que esta vista funcione
class SensorDataView(APIView):
    """API para que los sensores reales envíen datos, sin autenticación de usuario (usaría token/key)"""
    def post(self, request, format=None):
        # Asegúrate de que MedicionSerializer existe y está importado
        # serializer = MedicionSerializer(data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Endpoint de API no implementado'}, status=status.HTTP_501_NOT_IMPLEMENTED)