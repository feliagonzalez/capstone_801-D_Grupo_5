import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController, IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  usuario = '';
  email = ''; 
  contrasena = '';
  confirmarcontrasena = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  
  async registrarUsuario() {
    
    if (this.contrasena !== this.confirmarcontrasena) {
      const t = await this.toastCtrl.create({ 
        message: 'Las contraseñas no coinciden.', 
        duration: 3000, 
        color: 'warning' 
      });
      await t.present();
      return; 
    }

    this.loading = true;
    try {
     
      const ok = await this.auth.register(this.usuario, this.email, this.contrasena); 
      
      this.loading = false;

      if (ok) {
        
        const t = await this.toastCtrl.create({ 
          message: '¡Registro exitoso! Ahora puedes iniciar sesión.', 
          duration: 3000, 
          color: 'success' 
        });
        await t.present();

       
        this.navCtrl.navigateRoot(['/login']);
      } else {
        
        const t = await this.toastCtrl.create({ 
          message: 'Error al registrar. El usuario/email podría estar en uso.', 
          duration: 3000, 
          color: 'danger' 
        });
        await t.present();
      }
    } catch (e) {
      this.loading = false;
      console.error('Error durante el registro:', e);
      const t = await this.toastCtrl.create({ 
        message: 'Error en el servidor. Intenta de nuevo más tarde.', 
        duration: 3000, 
        color: 'danger' 
      });
      await t.present();
    }
  }

  
  goToLogin() {
    this.navCtrl.navigateForward(['/login']);
  }
}

