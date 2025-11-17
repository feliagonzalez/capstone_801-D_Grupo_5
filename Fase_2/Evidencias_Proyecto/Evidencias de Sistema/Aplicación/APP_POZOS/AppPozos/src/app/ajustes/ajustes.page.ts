import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class AjustesPage implements OnInit {

  // --- Claves para el localStorage ---
  // Se usan para guardar y cargar los datos
  private readonly NOTIFICACIONES_KEY = 'appConfigNotificaciones';
  private readonly GLOBAL_CONFIG_KEY = 'appConfigGlobal';
  private readonly ESPECIFICA_CONFIG_KEY = 'appConfigEspecifica';

  public notificaciones = {
    email: true,
    push: false,
    sms: false
  };

  public usuarioEmail: string = "ana.huaico@ejemplo.com";

  public configGlobal = {
    activada: true,
    umbralBajo: 30,
    umbralAlto: 50
  };

  public configEspecifica = [
    { id: 1, nombre: 'Pozo 1: San Martín', activada: true, umbralBajo: 35 },
    { id: 2, nombre: 'Pozo 2: El Sol', activada: true, umbralBajo: 30 },
    { id: 3, nombre: 'Pozo 3: La Luna', activada: false, umbralBajo: 30 },
  ];

  public mostrarEspecifica: boolean = false;

  constructor(private toastController: ToastController) { }

  ngOnInit() {
    
    this.cargarConfiguraciones();
  }

  // ---  Cargar desde localStorage ---
  cargarConfiguraciones() {
    const notificacionesGuardadas = localStorage.getItem(this.NOTIFICACIONES_KEY);
    const configGlobalGuardada = localStorage.getItem(this.GLOBAL_CONFIG_KEY);
    const configEspecificaGuardada = localStorage.getItem(this.ESPECIFICA_CONFIG_KEY);

    if (notificacionesGuardadas) {
      this.notificaciones = JSON.parse(notificacionesGuardadas);
    }
    if (configGlobalGuardada) {
      this.configGlobal = JSON.parse(configGlobalGuardada);
    }
    if (configEspecificaGuardada) {
      this.configEspecifica = JSON.parse(configEspecificaGuardada);
    }
    
   
  }

  // ---  Guardar en localStorage ---
  async guardarConfiguracion() {

   
    if (this.configGlobal.umbralBajo >= this.configGlobal.umbralAlto) {
      await this.presentToast('Error: El "Nivel Bajo" no puede ser mayor o igual que el "Nivel Medio".', 'danger');
      return;
    }

    // ===  Guardar en localStorage ===
    try {
      localStorage.setItem(this.NOTIFICACIONES_KEY, JSON.stringify(this.notificaciones));
      localStorage.setItem(this.GLOBAL_CONFIG_KEY, JSON.stringify(this.configGlobal));
      localStorage.setItem(this.ESPECIFICA_CONFIG_KEY, JSON.stringify(this.configEspecifica));
      
      await this.presentToast('Configuración guardada exitosamente.', 'success');

      console.log('Configuración guardada en localStorage.');

    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      await this.presentToast('Error al guardar la configuración.', 'danger');
    }
  }

  
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      cssClass: 'safe-area-toast'
    });
    toast.present();
  }

}