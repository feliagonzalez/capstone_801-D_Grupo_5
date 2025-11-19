import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { IonicModule, ToastController, NavController } from '@ionic/angular'; 
import { RouterModule } from '@angular/router';
import { PozosService, Pozo } from '../services/pozos.service'; 

@Component({
  selector: 'app-crearpozo',
  templateUrl: './crearpozo.page.html',
  styleUrls: ['./crearpozo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule,
    RouterModule,
  ]
})
export class CrearpozoPage implements OnInit {
  
  public pozo: Pozo = {
    nombre: '',
    latitud: null,
    longitud: null,
    profundidadTotal: null,
    diametro: null,
    vidaUtilRestante: null,
    fechaInstalacion: '', 
    activo: true, 
    fechaCreacion: null, 
    uidUsuario: '',

    
    configEspecificaActiva: false,
    configUmbralBajo: 30           
    
  };

  public loading: boolean = false; 

  constructor(
    private pozosService: PozosService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  async guardarPozo(form: NgForm) { 
    
    if (form.invalid) {
      await this.presentToast('⚠️ Por favor, completa todos los campos obligatorios (*).', 'warning');
      return;
    }
    
    this.loading = true; 

    try {
     
      const pozoId = await this.pozosService.crearPozo(this.pozo); 

      if (pozoId) {
        await this.presentToast('¡Registro Exitoso! Pozo guardado en la base de datos.', 'success');
        
       
        form.resetForm();
        this.pozo = {
          nombre: '',
          latitud: null,
          longitud: null,
          profundidadTotal: null,
          diametro: null,
          vidaUtilRestante: null,
          fechaInstalacion: '',
          activo: true,
          fechaCreacion: null,
          uidUsuario: '',
          configEspecificaActiva: false,
          configUmbralBajo: 30
        };
       

        this.navCtrl.back(); 
      } else {
        await this.presentToast('Error al guardar. Verifica tu conexión.', 'danger');
      }

    } catch (error) {
      console.error('Error al guardar pozo:', error);
      await this.presentToast('Error de servidor. Intenta de nuevo.', 'danger');
    } finally {
      this.loading = false; 
    }
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