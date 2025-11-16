import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
export class ReportesPage implements OnInit {

  // --- Filtros (Tu código) ---
  filtroPozo: string = 'todos';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  
  public selectedSegment: string = 'mediciones'; // 'mediciones' o 'alertas'


  historialMediciones: any[] = [];
  
  // 1. Aquí van los datos del historial de alertas (Datos de ejemplo)
  public historialAlertas = [
    {
      id: 1,
      pozoNombre: 'Pozo 2: El Sol',
      titulo: 'Nivel Bajo',
      mensaje: 'El nivel descendió a 25%',
      fecha: new Date('2025-11-15T14:30:00'),
      tipo: 'bajo' // 'bajo', 'medio', 'error'
    },
    {
      id: 2,
      pozoNombre: 'Pozo 3: La Luna',
      titulo: 'Error de Sensor',
      mensaje: 'Se perdió la conexión con el sensor',
      fecha: new Date('2025-11-15T09:15:00'),
      tipo: 'error'
    },
    {
      id: 3,
      pozoNombre: 'Pozo 2: El Sol',
      titulo: 'Nivel Medio',
      mensaje: 'El nivel descendió a 45%',
      fecha: new Date('2025-11-14T18:00:00'),
      tipo: 'medio'
    },
    {
      id: 4,
      pozoNombre: 'Pozo 6: El Seco',
      titulo: 'Nivel Bajo',
      mensaje: 'El nivel descendió a 15%',
      fecha: new Date('2025-11-14T11:20:00'),
      tipo: 'bajo'
    },
  ];

  loading: boolean = false;
  busquedaRealizada: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  generarReporte() {
    this.loading = true;
    this.busquedaRealizada = true;
    console.log('Buscando reportes con:', this.filtroPozo, this.filtroFechaInicio, this.filtroFechaFin);

    setTimeout(() => {
      const datosSimulados = [
        { pozo: 'Pozo 1 (Central)', fecha: '15/11/2025, 10:00 AM', nivel: '8.2m', estado: 'Bombeando' },
        { pozo: 'Pozo 1 (Central)', fecha: '15/11/2025, 09:00 AM', nivel: '8.5m', estado: 'Apagado' },
        { pozo: 'Pozo 2 (Norte)', fecha: '15/11/2025, 08:30 AM', nivel: '10.1m', estado: 'Apagado' },
        { pozo: 'Pozo 1 (Central)', fecha: '15/11/2025, 08:00 AM', nivel: '8.7m', estado: 'Bombeando' }
      ];

      if (this.filtroPozo !== 'todos') {
        
        this.historialMediciones = datosSimulados.filter(item => item.pozo === this.filtroPozo);
      } else {
        
        this.historialMediciones = datosSimulados;
      }

      this.loading = false;
    }, 1500);
  }

  descargarPDF() {
    const doc = new jsPDF();
    const head = [['Pozo', 'Fecha y Hora', 'Nivel de Agua', 'Estado']];

    
    const body = this.historialMediciones.map(item => {
      return [item.pozo, item.fecha, item.nivel, item.estado];
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
      headStyles: {
        fillColor: [38, 112, 210]
      }
    });

    doc.save('reporte_mediciones.pdf');
  }

  getColor(alerta: any): string {
    switch (alerta.tipo) {
      case 'error':
      case 'bajo':
        return 'danger'; // Rojo
      case 'medio':
        return 'warning'; // Amarillo
      default:
        return 'success'; // Verde
    }
  }

  getIcon(alerta: any): string {
    switch (alerta.tipo) {
      case 'error':
      case 'bajo':
        return 'warning-sharp'; // ⚠️
      case 'medio':
        return 'alert-circle-sharp'; // 🟡
      default:
        return 'checkmark-circle-sharp'; // ✅
    }
  }
}