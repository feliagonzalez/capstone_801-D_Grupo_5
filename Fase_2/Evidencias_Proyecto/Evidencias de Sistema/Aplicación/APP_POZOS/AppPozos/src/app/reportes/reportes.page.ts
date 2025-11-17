import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PozosService, Pozo } from '../services/pozos.service';
import { FirebaseService, ConfigGlobal } from '../services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
  ]
})
export class ReportesPage implements OnInit, OnDestroy {

  // --- Filtros ---
  filtroPozo: string = 'todos';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  
  public selectedSegment: string = 'mediciones';
  
  // --- Listas de datos ---
  historialMediciones: any[] = []; // Se llena con 'generarReporte()'

 
  public pozosEnAlerta: Pozo[] = [];
  
  
  
  public pozosDelUsuario: Pozo[] = [];
  private pozosSubscription!: Subscription;
  public configGlobal!: ConfigGlobal;
  private configSubscription!: Subscription;

  loading: boolean = false;
  busquedaRealizada: boolean = false;
  public todayString: string;

  constructor(
    private pozosService: PozosService,
    private firebaseService: FirebaseService,
    private toastCtrl: ToastController
  ) {
    const today = new Date();
    this.todayString = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    
    this.pozosSubscription = this.pozosService.pozosDelUsuario$.subscribe(pozos => {
      this.pozosDelUsuario = pozos;
      this.filtrarPozosEnAlerta(); 
    });

    
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      this.configGlobal = config;
      this.filtrarPozosEnAlerta(); 
    });
  }

  ngOnDestroy() {
    if (this.pozosSubscription) this.pozosSubscription.unsubscribe();
    if (this.configSubscription) this.configSubscription.unsubscribe();
  }

  
  filtrarPozosEnAlerta() {
    
    if (!this.pozosDelUsuario || !this.configGlobal) {
      this.pozosEnAlerta = [];
      return;
    }

    this.pozosEnAlerta = this.pozosDelUsuario.filter(pozo => {
      const estado = this.getEstado(pozo);
      return estado === 'bajo' || estado === 'medio';
    });
  }


  
  async generarReporte() {
    this.loading = true;
    this.busquedaRealizada = true;
    this.historialMediciones = []; 

    
    if (this.filtroFechaInicio && this.filtroFechaFin && this.filtroFechaInicio > this.filtroFechaFin) {
      await this.presentToast('Error: La "Fecha de Inicio" no puede ser posterior a la "Fecha de Fin".', 'danger');
      this.loading = false;
      return; 
    }

    
    if (this.filtroFechaFin && this.filtroFechaFin > this.todayString) {
      await this.presentToast('Error: La "Fecha de Fin" no puede ser una fecha futura.', 'danger');
      this.loading = false;
      return; 
    }

    console.log('Generando reporte con:', this.filtroPozo, this.filtroFechaInicio, this.filtroFechaFin);
    
    
    setTimeout(() => {
      
      // 1. Filtrar por Pozo
      let pozosFiltrados = this.pozosDelUsuario;
      if (this.filtroPozo !== 'todos') {
        pozosFiltrados = pozosFiltrados.filter(p => p.nombre === this.filtroPozo);
      }

      // 2. Filtrar por Fecha de Inicio
      if (this.filtroFechaInicio) {
        pozosFiltrados = pozosFiltrados.filter(p => p.fechaInstalacion && p.fechaInstalacion >= this.filtroFechaInicio);
      }

      // 3. Filtrar por Fecha de Fin
      if (this.filtroFechaFin) {
        pozosFiltrados = pozosFiltrados.filter(p => p.fechaInstalacion && p.fechaInstalacion <= this.filtroFechaFin);
      }

      // 4. Mapear los resultados finales
      this.historialMediciones = pozosFiltrados.map(pozo => {
        const estadoString = this.getEstado(pozo);
        const vidaUtil = (pozo.vidaUtilRestante === null || pozo.vidaUtilRestante === undefined) 
          ? 'N/A' 
          : `${pozo.vidaUtilRestante}%`;

        const profundidad = (pozo.profundidadTotal === null || pozo.profundidadTotal === undefined)
          ? 'N/A'
          : `${pozo.profundidadTotal}m`;

        return {
          pozo: pozo.nombre,
          fecha: pozo.fechaInstalacion, 
          vidaUtil: vidaUtil,
          estado: this.getTextoEstado(estadoString),
          profundidad: profundidad
        };
      });

      this.loading = false; 
    }, 1000);
  }

  // --- 'descargarPDF()' (Para Mediciones) ---
  descargarPDF() {
    const doc = new jsPDF();
    
    const head = [['Pozo', 'Fecha Instalación', 'Vida Útil', 'Profundidad', 'Estado']];

    const body = this.historialMediciones.map(item => {
      return [item.pozo, item.fecha, item.vidaUtil, item.profundidad, item.estado];
    });

    doc.setFontSize(18);
    doc.text('Reporte de Historial de Pozos', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Filtros Aplicados:`, 14, 30);
    doc.text(`- Pozo: ${this.filtroPozo}`, 14, 36);
    doc.text(`- Desde: ${this.filtroFechaInicio || 'N/A'}`, 14, 42);
    doc.text(`- Hasta: ${this.filtroFechaFin || 'N/A'}`, 14, 48);
    
    autoTable(doc, {
      head: head,
      body: body,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [38, 112, 210] }
    });
    
    doc.save('reporte_mediciones.pdf');
  }
  
  
  descargarAlertasPDF() {
    const doc = new jsPDF();
    
    const head = [['Pozo', 'Estado', 'Fecha Instalación']];

    const body = this.pozosEnAlerta.map(pozo => {
      const estadoTexto = this.getTextoEstado(this.getEstado(pozo));
      
      const fecha = pozo.fechaInstalacion 
        ? new Date(pozo.fechaInstalacion).toLocaleDateString('es-CL') // Formato dd/MM/yyyy
        : 'N/A';

      return [pozo.nombre, estadoTexto, fecha];
    });

    doc.setFontSize(18);
    doc.text('Reporte de Pozos en Alerta', 14, 22);
    
    autoTable(doc, {
      head: head,
      body: body,
      startY: 30, 
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69] } 
    });
    
    doc.save('reporte_alertas.pdf');
  }
  

 
  
  
  public getTextoEstado(estado: string): string {
    if (estado === 'bajo') return 'Critico';
    if (estado === 'medio') return 'Medio';
    if (estado === 'optimo') return 'Optimo';
    return 'N/A';
  }

  
  public getEstado(pozo: Pozo): string { 
    if (!this.configGlobal) return 'optimo'; 

    if (pozo.vidaUtilRestante === null || pozo.vidaUtilRestante === undefined) return 'optimo';

    if (pozo.vidaUtilRestante < this.configGlobal.umbralBajo) return 'bajo';
    if (pozo.vidaUtilRestante >= this.configGlobal.umbralBajo && pozo.vidaUtilRestante <= this.configGlobal.umbralAlto) return 'medio';
    
    return 'optimo';
  }

  // --- Funciones de Icono/Color para Pozos en Alerta ---
  getColorForPozo(pozo: Pozo): string {
    const estado = this.getEstado(pozo);
    switch (estado) {
      case 'error':
      case 'bajo':
        return 'danger'; // Rojo
      case 'medio':
        return 'warning'; // Amarillo
      default:
        return 'success'; // Verde
    }
  }

  getIconForPozo(pozo: Pozo): string {
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

  
  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      cssClass: 'safe-area-toast' 
    });
    toast.present();
  }
}