import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FirebaseService, ConfigGlobal } from '../services/firebase.service';
import { Subscription } from 'rxjs';

import { PozosService, Pozo } from '../services/pozos.service';

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

  public notificaciones: any = {
    email: true,
    push: false,
    wsp: false,
    numeroWsp: ''
  };

  public usuarioEmail: string = "usuario@ejemplo.com"; // Puedes traerlo del AuthService si quieres

  public configGlobal!: ConfigGlobal;
  private configSubscription!: Subscription;

  public pozosDelUsuario: Pozo[] = [];
  private pozosSubscription!: Subscription;
  
  public mostrarEspecifica: boolean = false;

  constructor(
    private toastController: ToastController,
    private firebaseService: FirebaseService,
    private pozosService: PozosService
  ) { }

  ngOnInit() {
    
    this.configSubscription = this.firebaseService.onSettingsChange.subscribe(config => {
      if (config) {
        this.configGlobal = config;
        
        // Sincronizar los toggles locales con lo que viene de Firebase
        if (config.notificaciones) {
          this.notificaciones = { ...config.notificaciones };
        }
      }
    });

    this.pozosSubscription = this.pozosService.pozosDelUsuario$.subscribe(pozos => {
      this.pozosDelUsuario = pozos;
    });
  }

  ngOnDestroy() {
    if (this.configSubscription) this.configSubscription.unsubscribe();
    if (this.pozosSubscription) this.pozosSubscription.unsubscribe();
  }

  async guardarConfiguracion() {

    if (this.configGlobal.umbralBajo >= this.configGlobal.umbralAlto) {
      await this.presentToast('Error: El "Nivel Bajo" no puede ser mayor o igual que el "Nivel Medio".', 'danger');
      return;
    }

    try {
      
     
      this.configGlobal.notificaciones = this.notificaciones;

      await this.firebaseService.saveSettings(this.configGlobal);
          
      if (this.mostrarEspecifica && this.pozosDelUsuario.length > 0) {
        const updates = this.pozosDelUsuario.map(pozo => 
          this.pozosService.updatePozo(pozo) 
        );
        await Promise.all(updates); 
      }
      
      await this.presentToast('Configuración guardada exitosamente.', 'success');

    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
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