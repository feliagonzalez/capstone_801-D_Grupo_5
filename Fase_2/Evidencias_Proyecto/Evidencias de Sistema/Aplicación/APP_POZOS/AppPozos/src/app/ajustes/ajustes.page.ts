import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class AjustesPage implements OnInit {

 
  public notificaciones = {
    email: true,
    push: false,
    sms: false
  };

  // Email del usuario (debería venir del servicio de auth)
  public usuarioEmail: string = "ana.huaico@ejemplo.com";

  
  
  
  // Configuración global (para todos los pozos)
  public configGlobal = {
    activada: true,
    umbralBajo: 30, // Nivel por defecto (en %)
    umbralAlto: 50  // Nivel por defecto (en %)
  };

  // Configuración específica (permite "sobre-escribir" la global)
  public configEspecifica = [
    { id: 1, nombre: 'Pozo 1: San Martín', activada: true, umbralBajo: 35 },
    { id: 2, nombre: 'Pozo 2: El Sol', activada: true, umbralBajo: 30 },
    { id: 3, nombre: 'Pozo 3: La Luna', activada: false, umbralBajo: 30 },
    
  ];

  // Bandera para mostrar/ocultar la config. específica
  public mostrarEspecifica: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  // Función para guardar la configuración (simulada)
  guardarConfiguracion() {
    console.log('Guardando configuración de envío:', this.notificaciones);
    console.log('Guardando configuración global:', this.configGlobal);
    console.log('Guardando configuración específica:', this.configEspecifica);
    
    // Aquí iría la lógica para enviar esto a un backend o servicio
    // ...
  }

}