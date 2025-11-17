import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FirebaseService, ConfigGlobal } from '../services/firebase.service';
import { Subscription } from 'rxjs';

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
export class AjustesPage implements OnInit, OnDestroy {

  

  public notificaciones = {
    email: true,
    push: false,
    sms: false
  };

  public usuarioEmail: string = "ana.huaico@ejemplo.com";

  // configGlobal ahora se cargará desde el servicio
  public configGlobal!: ConfigGlobal;
  
  
  private configSubscription!: Subscription;

  public configEspecifica = [
    // ... (esto aún no lo estamos guardando en Firebase, solo el global)
    { id: 1, nombre: 'Pozo 1: San Martín', activada: true, umbralBajo: 35 },
    { id: 2, nombre: 'Pozo 2: El Sol', activada: true, umbralBajo: 30 },
    { id: 3, nombre: 'Pozo 3: La Luna', activada: false, umbralBajo: 30 },
  ];

  public mostrarEspecifica: boolean = false;

 
  constructor(
    private toastController: ToastController,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    
    // Carga los datos de la BD en cuanto entra a la página
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      console.log('Página de Ajustes recibió config:', config);
      this.configGlobal = config;
    });
  }

  ngOnDestroy() {
    
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

  

  
  async guardarConfiguracion() {

   
    if (this.configGlobal.umbralBajo >= this.configGlobal.umbralAlto) {
      await this.presentToast('Error: El "Nivel Bajo" no puede ser mayor o igual que el "Nivel Medio".', 'danger');
      return;
    }

    // ===  Guardar en Firebase ===
    try {
      // Llama al servicio para guardar los datos
      await this.firebaseService.saveSettings(this.configGlobal);
      
      
      await this.presentToast('Configuración guardada exitosamente.', 'success');

    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
      await this.presentToast('Error al guardar la configuración.', 'danger');
    }
  }

  // --- Función Helper (Sin cambios) ---
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