import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// IMPORTA 'Map' DE LEAFLET
import { Map, latLng, tileLayer, marker, icon } from 'leaflet';

// --- Servicios de Firebase ---
import { FirebaseService, ConfigGlobal } from '../services/firebase.service';
import { Subscription } from 'rxjs';
import { PozosService, Pozo } from '../services/pozos.service';


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
export class DashboardPage implements OnInit, OnDestroy { 

  
  public configGlobal!: ConfigGlobal; 
  private configSubscription!: Subscription;

  
  public pozos: Pozo[] = [];
  private pozosSubscription!: Subscription; // Suscripción para la lista de pozos
 
  
  public alertCount = { critical: 0, warning: 0 };

  // --- Lógica del Mapa  ---
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

  
  constructor(
    private firebaseService: FirebaseService,
    private pozosService: PozosService
  ) { }

  ngOnInit() {
    
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      console.log('Dashboard recibió config:', config);
      this.configGlobal = config;
      this.updateAlertSummary(); 
    });

    
    this.pozosSubscription = this.pozosService.pozosDelUsuario$.subscribe(pozos => {
      this.pozos = pozos; // Actualizar la lista local con los datos de Firebase
      console.log('Dashboard recibió pozos:', pozos);
      this.updateAlertSummary();
    });
  }

 
  ngOnDestroy() {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    if (this.pozosSubscription) {
      this.pozosSubscription.unsubscribe();
    }
  }

  // --- Métodos del Mapa (Tu código - SIN CAMBIOS) ---
  onMapReady(map: Map) {
    this.map = map;
  }

  ionViewDidEnter() {
    
    
    //  lógica del mapa
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 500);
    }
  }

  getEstado(pozo: Pozo): string { 
    // @ts-ignore: 'error' 
    if (pozo.error) return 'error';
    
    if (!this.configGlobal) return 'optimo'; 

    
    if (pozo.vidaUtilRestante === null || pozo.vidaUtilRestante === undefined) return 'optimo';

   
    if (pozo.vidaUtilRestante < this.configGlobal.umbralBajo) return 'bajo';
    if (pozo.vidaUtilRestante >= this.configGlobal.umbralBajo && pozo.vidaUtilRestante <= this.configGlobal.umbralAlto) return 'medio';
    
    return 'optimo';
  }


  getColor(pozo: Pozo): string {
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

  getIcon(pozo: Pozo): string {
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

  
  getStatusText(pozo: Pozo): string {
    // @ts-ignore
    if (pozo.error) return `Error: ${pozo.error}`;

    const estado = this.getEstado(pozo);
    let textoEstado = '';

    if (estado === 'bajo') {
      textoEstado = ' (Nivel Crítico)'; 
    } else if (estado === 'medio') {
      textoEstado = ' (Nivel Medio)';
    } else if (estado === 'optimo') {
      textoEstado = ' (Nivel Óptimo)';
    }

   
    const vidaUtil = (pozo.vidaUtilRestante === null || pozo.vidaUtilRestante === undefined) 
      ? 'N/A' 
      : `${pozo.vidaUtilRestante}%`;

    return `Vida útil: ${vidaUtil}${textoEstado}`;
  }


  updateAlertSummary() {
    
    if (!this.configGlobal || !this.pozos) return; 

    this.alertCount.critical = this.pozos.filter(p => this.getEstado(p) === 'error' || this.getEstado(p) === 'bajo').length;
    this.alertCount.warning = this.pozos.filter(p => this.getEstado(p) === 'medio').length;
  }
}