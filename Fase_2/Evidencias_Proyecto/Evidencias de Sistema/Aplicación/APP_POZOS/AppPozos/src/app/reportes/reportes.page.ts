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
  historialMediciones: any[] = []; 
  public pozosEnAlerta: Pozo[] = []; 
  
  public pozosDelUsuario: Pozo[] = [];
  private pozosSubscription!: Subscription;
  public configGlobal!: ConfigGlobal;
  private configSubscription!: Subscription;

  loading: boolean = false;
  busquedaRealizada: boolean = false; // Controla si mostramos resultados o vacío
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
    // Cargar datos, pero NO filtrar todavía
    this.pozosSubscription = this.pozosService.pozosDelUsuario$.subscribe(pozos => {
      this.pozosDelUsuario = pozos;
    });

    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      this.configGlobal = config;
    });
  }

  ngOnDestroy() {
    if (this.pozosSubscription) this.pozosSubscription.unsubscribe();
    if (this.configSubscription) this.configSubscription.unsubscribe();
  }

  
  async generarReporte() {
    this.loading = true;
    this.busquedaRealizada = true; // Ahora sí mostramos resultados
    this.historialMediciones = []; 
    this.pozosEnAlerta = []; // Limpiamos alertas anteriores

    // Validaciones de fecha
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

    console.log('Generando reporte con filtros:', this.filtroPozo);
    
    
    setTimeout(() => {
      
      // ==========================================
      // 1. FILTRADO BASE (Para ambas pestañas)
      // ==========================================
      let pozosFiltrados = this.pozosDelUsuario;

      // Filtro por Nombre de Pozo
      if (this.filtroPozo !== 'todos') {
        pozosFiltrados = pozosFiltrados.filter(p => p.nombre === this.filtroPozo);
      }

      // Filtro por Fechas (Aplicado a fecha de instalación)
      if (this.filtroFechaInicio) {
        pozosFiltrados = pozosFiltrados.filter(p => p.fechaInstalacion && p.fechaInstalacion >= this.filtroFechaInicio);
      }
      if (this.filtroFechaFin) {
        pozosFiltrados = pozosFiltrados.filter(p => p.fechaInstalacion && p.fechaInstalacion <= this.filtroFechaFin);
      }

     
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

     
      // De los pozos que pasaron el filtro (nombre/fecha), vemos cuáles están mal
      this.pozosEnAlerta = pozosFiltrados.filter(pozo => {
        const estado = this.getEstado(pozo);
        
        return estado === 'bajo' || estado === 'medio';
      });

      this.loading = false; 
    }, 1000);
  }

  // --- PDFs ---
  descargarPDF() {
    const doc = new jsPDF();
    const head = [['Pozo', 'Fecha Instalación', 'Vida Útil', 'Profundidad', 'Estado']];
    const body = this.historialMediciones.map(item => {
      return [item.pozo, item.fecha, item.vidaUtil, item.profundidad, item.estado];
    });

    doc.setFontSize(18);
    doc.text('Reporte de Historial de Pozos', 14, 22);
    
    autoTable(doc, {
      head: head,
      body: body,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [16, 42, 67] } 
    });
    
    doc.save('reporte_mediciones.pdf');
  }
  
  descargarAlertasPDF() {
    const doc = new jsPDF();
    const head = [['Pozo', 'Estado', 'Fecha Instalación']];
    const body = this.pozosEnAlerta.map(pozo => {
      const estadoTexto = this.getTextoEstado(this.getEstado(pozo));
      const fecha = pozo.fechaInstalacion 
        ? new Date(pozo.fechaInstalacion).toLocaleDateString('es-CL')
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
  
  // --- Helpers de Estado ---
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

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}