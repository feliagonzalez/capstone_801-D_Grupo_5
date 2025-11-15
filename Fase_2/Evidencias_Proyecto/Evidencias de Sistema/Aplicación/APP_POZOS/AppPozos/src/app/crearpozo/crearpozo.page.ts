import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crearpozo',
  templateUrl: './crearpozo.page.html',
  styleUrls: ['./crearpozo.page.scss'],

  // Standalone: Esto garantiza que FormsModule sea reconocido.
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule,
    RouterModule,
  ]
})
export class CrearpozoPage implements OnInit {
  
  // Objeto de datos
  pozoData = {
    nombre: '',
    latitud: null,
    longitud: null,
    profundidadTotal: null,
    diametro: null,
    tipoAcumifero: '',
    nivelEstaticoInicial: null,
    activo: true, 
  };

  constructor() { }

  ngOnInit() {
  }

  // Función de envío
  guardarPozo(form: NgForm) { 
    if (form.valid) {
      console.log('Datos listos para enviar:', form.value);
      alert('¡Registro Exitoso! Los datos están en la consola.');
      form.resetForm();
      this.pozoData.activo = true; 
    } else {
      alert('⚠️ Por favor, completa todos los campos obligatorios (*).');
    }
  }

}