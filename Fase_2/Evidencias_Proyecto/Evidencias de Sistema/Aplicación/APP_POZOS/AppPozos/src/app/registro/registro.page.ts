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
  // Propiedades actualizadas
  usuario = '';
  email = ''; // <--- NUEVA PROPIEDAD
  contrasena = '';
  confirmarcontrasena = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  // Renombrado de 'login' a 'registrarUsuario' para coincidir con el HTML
  async registrarUsuario() {
    // 1. Validar que las contraseñas coincidan
    if (this.contrasena !== this.confirmarcontrasena) {
      const t = await this.toastCtrl.create({ 
        message: 'Las contraseñas no coinciden.', 
        duration: 3000, 
        color: 'warning' 
      });
      await t.present();
      return; // Detener la función si no coinciden
    }

    this.loading = true;
    try {
      // 2. Llamar al servicio de autenticación para REGISTRAR
      // NOTA: Asumo que tu AuthService tiene un método 'register'
      const ok = await this.auth.register(this.usuario, this.email, this.contrasena); 
      
      this.loading = false;

      if (ok) {
        // Registro exitoso
        const t = await this.toastCtrl.create({ 
          message: '¡Registro exitoso! Ahora puedes iniciar sesión.', 
          duration: 3000, 
          color: 'success' 
        });
        await t.present();

        // Navegar a la página de LOGIN después del registro
        this.navCtrl.navigateRoot(['/login']);
      } else {
        // Manejar el caso de que el servicio devuelva 'false' (ej: usuario o email ya existen)
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

  // Función para ir a la página de Login
  goToLogin() {
    this.navCtrl.navigateForward(['/login']);
  }
}

// Asegúrate de actualizar el método 'register' en tu AuthService para aceptar usuario, email y contraseña.