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

  
  filtroPozo: string = 'todos';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  
  historial: any[] = [];
  
  
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
        this.historial = datosSimulados.filter(item => item.pozo === this.filtroPozo);
      } else {
        this.historial = datosSimulados;
      }

      this.loading = false; 
    }, 1500);
  }

  descargarPDF() {
    // 1. Crear el documento PDF
    const doc = new jsPDF();

   
    const head = [['Pozo', 'Fecha y Hora', 'Nivel de Agua', 'Estado']];

   
    const body = this.historial.map(item => {
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
}