import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController, IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage {
  usuario = '';
  contrasena = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async login() {
    this.loading = true;
    try {
      const ok = await this.auth.login(this.usuario, this.contrasena);
      this.loading = false;
      if (ok) {
        // navegar al home y reemplazar el historial para que el usuario no vuelva al login con atrás
        try {
          // preferir NavController para comportamiento típico de Ionic
          this.navCtrl.navigateRoot(['/home']);
        } catch (e) {
          // fallback al Router si NavController falla
          this.router.navigate(['/home']);
        }
      } else {
        const t = await this.toastCtrl.create({ message: 'Credenciales inválidas', duration: 2000, color: 'danger' });
        await t.present();
      }
    } catch (e) {
      this.loading = false;
      const t = await this.toastCtrl.create({ message: 'Error al intentar iniciar sesión', duration: 2000, color: 'danger' });
      await t.present();
    }
  }

  goRegister() {
    this.router.navigate(['/registro']);
  }

}
