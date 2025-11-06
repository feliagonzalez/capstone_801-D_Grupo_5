import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Necesario
import { FormsModule } from '@angular/forms'; // <-- Necesario
import { IonicModule } from '@ionic/angular'; // <-- Necesario
import { RouterModule } from '@angular/router'; // <-- Necesario
import { LeafletModule } from '@asymmetrik/ngx-leaflet'; // <-- NecesARIO

import { latLng, tileLayer, marker, icon } from 'leaflet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],

  standalone: true, // <-- La clave
  imports: [ // <-- La clave
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    LeafletModule
  ]
})
export class DashboardPage implements OnInit {

  // Opciones de configuración del mapa
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 18, 
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        // ⬇️ AÑADE ESTAS DOS LÍNEAS ⬇️
        
        keepBuffer: 10       // Carga un "colchón" más grande de azulejos alrededor
       
      })
    ],
    zoom: 13,
    center: latLng(-33.59822, -70.71881),
    fadeAnimation: true, // Hace que los azulejos aparezcan suavemente (fade in)
  };

  // Capas (marcadores) que irán sobre el mapa
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
}