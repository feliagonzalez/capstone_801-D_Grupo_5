import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// 1. IMPORTA 'Map' DE LEAFLET
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

  // 2. ARREGLA EL ERROR TS2564 AÑADIENDO "!"
  // (Le dice a TypeScript: "Confía en mí, esta variable se asignará")
  private map!: Map;

  // Opciones de configuración del mapa (Tu código está perfecto)
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

  // Capas (marcadores) (Tu código está perfecto)
  layers = [
    marker([-33.59822, -70.71881], {
      icon: icon({
         iconSize: [ 25, 41 ],
         iconAnchor: [ 13, 41 ],
         iconUrl: 'assets/marker-icon.png',
         shadowUrl: 'assets/marker-shadow.png'
      })
    })
  ];

  constructor() {} 

  ngOnInit() {
  }

  // 3. AÑADE ESTAS DOS FUNCIONES
  // (Esto arregla el error TS2339 'onMapReady')

  // Esta función se conecta con el (leafletMapReady) del HTML
  onMapReady(map: Map) {
    this.map = map;
  }

  // Esta función "repara" el mapa cuando la página entra en vista
  ionViewDidEnter() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize(); // recalcula el tamaño del mapa
      }, 500); // Un pequeño retraso para asegurar que todo esté listo
    }
  }
}