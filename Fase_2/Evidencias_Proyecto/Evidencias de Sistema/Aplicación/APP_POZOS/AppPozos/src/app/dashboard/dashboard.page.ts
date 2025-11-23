import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';


import { Map, latLng, tileLayer, marker, icon, Layer, featureGroup } from 'leaflet';

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
  private pozosSubscription!: Subscription; 
 
  public alertCount = { critical: 0, warning: 0 };
  public criticalWells: string[] = [];
  public warningWells: string[] = [];

  // --- Lógica del Mapa ---
  private map!: Map;

  // Configuración base del mapa
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; OpenStreetMap',
      })
    ],
    zoom: 10, 
    center: latLng(-33.59822, -70.71881), 
    zoomControl: false 
  };

  
  layers: Layer[] = [];

  
  private pozoIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [1, -34], 
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  constructor(
    private firebaseService: FirebaseService,
    private pozosService: PozosService
  ) { }

  ngOnInit() {
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      this.configGlobal = config;
      this.updateAlertSummary(); 
      this.actualizarMarcadores(); // Actualizamos por si cambian los umbrales
    });

    this.pozosSubscription = this.pozosService.pozosDelUsuario$.subscribe(pozos => {
      this.pozos = pozos; 
      this.updateAlertSummary();
      
      
      this.actualizarMarcadores();
    });
  }

  ngOnDestroy() {
    if (this.configSubscription) this.configSubscription.unsubscribe();
    if (this.pozosSubscription) this.pozosSubscription.unsubscribe();
  }

 

  actualizarMarcadores() {
    
    const nuevosMarcadores: Layer[] = [];

    
    this.pozos.forEach(pozo => {
     
      if (pozo.latitud && pozo.longitud) {
        
       
        const nuevoMarker = marker([pozo.latitud, pozo.longitud], {
          icon: this.pozoIcon
        });

        // Generamos el HTML del Popup (Información al tocar)
        const estadoTexto = this.getStatusText(pozo);
        const colorEstado = this.getColor(pozo); 
        
       
        let colorHex = '#2dd36f'; 
        if (colorEstado === 'warning') colorHex = '#ffc409'; 
        if (colorEstado === 'danger') colorHex = '#eb445a'; 

        const popupContent = `
          <div style="text-align: center;">
            <h3 style="margin: 0; color: #333; font-weight: bold;">${pozo.nombre}</h3>
            <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px;">
              <strong style="color: ${colorHex};">${estadoTexto}</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
              Profundidad: ${pozo.profundidadTotal || '?'} m
            </p>
          </div>
        `;

        
        nuevoMarker.bindPopup(popupContent);

        
        nuevosMarcadores.push(nuevoMarker);
      }
    });

    
    this.layers = nuevosMarcadores;

    
    if (this.map && nuevosMarcadores.length > 0) {
        
        const group = featureGroup(nuevosMarcadores as any);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

 

  onMapReady(map: Map) {
    this.map = map;
    setTimeout(() => { map.invalidateSize(); }, 100);
  }

  ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize();
      setTimeout(() => { this.map.invalidateSize(); }, 300);
      setTimeout(() => { 
        this.map.invalidateSize();
        
        if (this.layers.length > 0) {
           const group = featureGroup(this.layers as any);
           this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
      }, 800);
    }
  }

  

  getEstado(pozo: Pozo): string { 
    // @ts-ignore 
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
      case 'bajo': return 'danger'; 
      case 'medio': return 'warning'; 
      default: return 'success'; 
    }
  }

  getIcon(pozo: Pozo): string {
    const estado = this.getEstado(pozo);
    switch (estado) {
      case 'error':
      case 'bajo': return 'warning'; 
      case 'medio': return 'alert-circle'; 
      default: return 'checkmark-circle'; 
    }
  }
  
  getStatusText(pozo: Pozo): string {
    // @ts-ignore
    if (pozo.error) return `Error: ${pozo.error}`;

    const estado = this.getEstado(pozo);
    let textoEstado = '';

    if (estado === 'bajo') textoEstado = ' (Crítico)'; 
    else if (estado === 'medio') textoEstado = ' (Medio)';
    else if (estado === 'optimo') textoEstado = ' (Óptimo)';

    const vidaUtil = (pozo.vidaUtilRestante === null || pozo.vidaUtilRestante === undefined) 
      ? 'N/A' 
      : `${pozo.vidaUtilRestante}%`;

    return `Vida útil: ${vidaUtil}${textoEstado}`;
  }

  updateAlertSummary() {
    if (!this.configGlobal || !this.pozos) return; 

    this.criticalWells = this.pozos
      .filter(p => this.getEstado(p) === 'error' || this.getEstado(p) === 'bajo')
      .map(p => p.nombre);

    this.warningWells = this.pozos
      .filter(p => this.getEstado(p) === 'medio')
      .map(p => p.nombre);
      
    
    this.alertCount.critical = this.criticalWells.length;
    this.alertCount.warning = this.warningWells.length;
  }
}