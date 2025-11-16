import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// IMPORTA 'Map' DE LEAFLET
import { Map, latLng, tileLayer, marker, icon } from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    LeafletModule
  ]
})
export class DashboardPage implements OnInit {

 

  // 1. Aquí van los datos de tus pozos
  public pozos = [
    { id: 1, nombre: 'Pozo 1: San Martín', nivel: 75, error: null },
    { id: 2, nombre: 'Pozo 2: El Sol', nivel: 40, error: null },
    { id: 3, nombre: 'Pozo 3: La Luna', nivel: null, error: 'Sensor desconectado' },
    { id: 4, nombre: 'Pozo 4: El Valle', nivel: 90, error: null },
    { id: 5, nombre: 'Pozo 5: La Montaña', nivel: 60, error: null },
   
    { id: 6, nombre: 'Pozo 6: El Seco', nivel: 25, error: null },
  ];

 
  public alertCount = { critical: 0, warning: 0 };


  private map!: Map;

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        keepBuffer: 10
      })
    ],
    zoom: 13,
    center: latLng(-33.59822, -70.71881),
    fadeAnimation: true,
  };

  layers = [
    marker([-33.59822, -70.71881], {
      icon: icon({
        iconSize: [25, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    })
  ];

  constructor() { }

  ngOnInit() {
    
    this.updateAlertSummary();
  }

  
  onMapReady(map: Map) {
    this.map = map;
  }

  ionViewDidEnter() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 500);
    }
  }

 
  getEstado(pozo: any): string {
    if (pozo.error) {
      return 'error';
    }
    if (pozo.nivel < 30) {
      return 'bajo'; 
    }
    if (pozo.nivel >= 30 && pozo.nivel <= 50) {
      return 'medio'; 
    }
    return 'optimo';
  }

  
  getColor(pozo: any): string {
    const estado = this.getEstado(pozo);
    switch (estado) {
      case 'error':
      case 'bajo':
        return 'danger';
      case 'medio':
        return 'warning'; 
      default:
        return 'success';
    }
  }

  
  getIcon(pozo: any): string {
    const estado = this.getEstado(pozo);
    switch (estado) {
      case 'error':
      case 'bajo':
        return 'warning-sharp'; // ⚠️
      case 'medio':
        return 'alert-circle-sharp'; // 🟡
      default:
        return 'checkmark-circle-sharp'; // ✅
    }
  }

  
  getStatusText(pozo: any): string {
    if (pozo.error) {
      return `Error: ${pozo.error}`;
    }

    
    const estado = this.getEstado(pozo);
    let textoEstado = '';

    if (estado === 'bajo') {
      textoEstado = ' (Nivel Bajo)';
    } else if (estado === 'medio') {
      textoEstado = ' (Nivel Medio)';
    } else if (estado === 'optimo') {
      textoEstado = ' (Nivel Óptimo)';
    }
    

    return `Nivel de agua: ${pozo.nivel}%${textoEstado}`;
  }

 
  updateAlertSummary() {
    this.alertCount.critical = this.pozos.filter(p => this.getEstado(p) === 'error' || this.getEstado(p) === 'bajo').length;
    this.alertCount.warning = this.pozos.filter(p => this.getEstado(p) === 'medio').length;
  }

  
}