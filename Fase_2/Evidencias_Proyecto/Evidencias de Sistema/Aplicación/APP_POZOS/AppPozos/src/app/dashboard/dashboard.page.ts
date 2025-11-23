import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// IMPORTA 'Map' DE LEAFLET
import { Map, latLng, tileLayer, marker, icon, Layer, featureGroup } from 'leaflet';

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
  private pozosSubscription!: Subscription; 
 
  public alertCount = { critical: 0, warning: 0 };
  public criticalWells: string[] = [];
  public warningWells: string[] = [];

  // --- Lógica del Mapa ---
  private map!: Map;

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
    private pozosService: PozosService,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      this.configGlobal = config;
      this.updateAlertSummary(); 
      this.actualizarMarcadores();
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

        const estadoTexto = this.getStatusText(pozo);
        const colorEstado = this.getColor(pozo); 
        
        let colorHex = '#2dd36f'; // verde
        if (colorEstado === 'warning') colorHex = '#ffc409'; // amarillo
        if (colorEstado === 'danger') colorHex = '#eb445a'; // rojo

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

    // Auto-zoom si hay marcadores
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

  // ============================================================
  //  LÓGICA DE ESTADOS
  // ============================================================
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

  // ============================================================
  //  LÓGICA DE MENSAJERÍA 
  // ============================================================

  async enviarAlertaInteligente(pozo: Pozo) {
    const usaEmail = this.configGlobal?.notificaciones?.email ?? false; 
    const usaWsp = this.configGlobal?.notificaciones?.wsp ?? false; 

    if (!usaEmail && !usaWsp) {
      const toast = await this.toastCtrl.create({
        message: 'Activa un método de notificación en Configuración.',
        duration: 3000,
        color: 'warning',
        position: 'top',
        cssClass: 'safe-area-toast'
      });
      toast.present();
      return;
    }

    if (usaWsp && !usaEmail) {
      this.enviarPorWhatsApp(pozo);
      return;
    }

    if (usaEmail && !usaWsp) {
      this.enviarPorCorreo(pozo);
      return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Enviar reporte de: ${pozo.nombre}`,
      subHeader: 'Métodos activos detectados',
      buttons: [
        {
          text: 'Enviar por WhatsApp',
          icon: 'logo-whatsapp',
          handler: () => { this.enviarPorWhatsApp(pozo); }
        },
        {
          text: 'Enviar por Correo',
          icon: 'mail-outline',
          handler: () => { this.enviarPorCorreo(pozo); }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // --- ENVÍO AUTOMÁTICO VÍA WHATSAPP (CallMeBot) ---
  async enviarPorWhatsApp(pozo: Pozo) {
    const miNumero = '56950075016'; 
    const apiKey = '6178715';       

    const mensaje = this.construirMensaje(pozo);
    const urlApi = `https://api.callmebot.com/whatsapp.php?phone=${miNumero}&text=${encodeURIComponent(mensaje)}&apikey=${apiKey}`;

    const toastCargando = await this.toastCtrl.create({
      message: 'Enviando WhatsApp automático...',
      duration: 2000,
      position: 'top',
      color: 'medium',
      cssClass: 'safe-area-toast'
    });
    toastCargando.present();

    try {
      await fetch(urlApi, { mode: 'no-cors' }); 
      const toastExito = await this.toastCtrl.create({
        message: '✅ WhatsApp enviado.',
        duration: 3000,
        position: 'top',
        color: 'success',
        cssClass: 'safe-area-toast'
      });
      toastExito.present();
    } catch (error) {
      console.error('Error al enviar WSP:', error);
    }
  }

  // --- ENVÍO AUTOMÁTICO VÍA CORREO (EmailJS) ---
  async enviarPorCorreo(pozo: Pozo) {
    
    // --- CONFIGURACIÓN DE EMAILJS (TUS CREDENCIALES REALES) ---
    const serviceID = 'service_6qr00yu';   
    const templateID = 'template_opvx63e'; 
    const publicKey = 'awqPQXKnI96SYkYaG'; 
    
    const emailDestino = 'ma.nenen@duocuc.cl'; 

    const toastCargando = await this.toastCtrl.create({
      message: 'Enviando correo automático...',
      duration: 2000,
      position: 'top',
      color: 'medium',
      cssClass: 'safe-area-toast'
    });
    toastCargando.present();

    const templateParams = {
      to_name: 'Admin',
      to_email: emailDestino,
      pozo_nombre: pozo.nombre,
      pozo_estado: this.getTextoEstadoVisual(this.getEstado(pozo)),
      message: this.construirMensaje(pozo)
    };

    try {
      const data = {
        service_id: serviceID,
        template_id: templateID,
        user_id: publicKey,
        template_params: templateParams
      };

      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      const toastExito = await this.toastCtrl.create({
        message: '✅ Correo enviado correctamente.',
        duration: 3000,
        position: 'top',
        color: 'success',
        cssClass: 'safe-area-toast'
      });
      toastExito.present();

    } catch (error) {
      console.error('Error al enviar Correo:', error);
      const toastError = await this.toastCtrl.create({
        message: '❌ Error al enviar correo. Verifica tu configuración.',
        duration: 3000,
        position: 'top',
        color: 'danger',
        cssClass: 'safe-area-toast'
      });
      toastError.present();
    }
  }

  private construirMensaje(pozo: Pozo): string {
    const estado = this.getTextoEstadoVisual(this.getEstado(pozo));
    const vida = pozo.vidaUtilRestante !== null ? `${pozo.vidaUtilRestante}%` : 'N/A';
    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString();

    return `🚨 *REPORTE DE ESTADO DE POZO* 🚨\n\n` +
           `📍 *Pozo:* ${pozo.nombre}\n` +
           `📊 *Estado:* ${estado}\n` +
           `🔋 *Vida Útil Restante:* ${vida}\n` +
           `📅 *Fecha:* ${fecha} - ${hora}\n\n` +
           `Se requiere revisión técnica inmediata.`;
  }

  private getTextoEstadoVisual(estadoKey: string): string {
    if (estadoKey === 'bajo') return 'CRÍTICO 🔴';
    if (estadoKey === 'medio') return 'MEDIO 🟡';
    return 'ÓPTIMO 🟢';
  }
}