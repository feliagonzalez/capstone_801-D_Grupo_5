# core/models.py
from django.db import models
from django.contrib.auth.models import User

class Pozo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    ubicacion = models.CharField(max_length=255)
    propietario = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Coordenadas (permiten valores nulos si no se especifican)
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.nombre

class Medicion(models.Model):
    pozo = models.ForeignKey(Pozo, on_delete=models.CASCADE, related_name='mediciones')
    fecha_hora = models.DateTimeField(auto_now_add=True)
    # DecimalField para alta precisión en la medición del nivel de agua
    nivel_agua = models.DecimalField(max_digits=6, decimal_places=2) 
    estado_sensor = models.CharField(max_length=50, default='Operativo')

    def __str__(self):
        return f"Medición de {self.pozo.nombre} - {self.fecha_hora.strftime('%Y-%m-%d %H:%M')}"

    # OPTIMIZACIÓN CRÍTICA: Añadir un índice compuesto
    class Meta:
        # Asegura que las consultas por pozo y tiempo sean muy rápidas (esencial para series de tiempo)
        indexes = [
            models.Index(fields=['pozo', 'fecha_hora']),
        ]
        # Ordenación por defecto (la más reciente primero)
        ordering = ['-fecha_hora']


class Alerta(models.Model):
    pozo = models.ForeignKey(Pozo, on_delete=models.CASCADE)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    descripcion = models.TextField()
    # Campo para indicar si el usuario ha visto o gestionado la alerta
    leida = models.BooleanField(default=False)
    # Se añade el propietario para que la alerta sea visible solo para el dueño del pozo
    propietario = models.ForeignKey(User, on_delete=models.CASCADE) 

    def __str__(self):
        return f"Alerta para {self.pozo.nombre} - {self.descripcion}"