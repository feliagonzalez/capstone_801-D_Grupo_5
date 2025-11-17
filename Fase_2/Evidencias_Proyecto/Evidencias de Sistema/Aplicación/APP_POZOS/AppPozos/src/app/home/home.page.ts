import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importar Router
import { IonicModule, NavController } from '@ionic/angular'; // Importar IonicModule
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { Subscription } from 'rxjs'; // Importar Subscription
import { AuthService } from '../services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true, // Asumiendo que usas standalone
  imports: [
    IonicModule,
    CommonModule, 
    RouterModule 
  ],
})
export class HomePage implements OnInit, OnDestroy {
  
  public nombreUsuario: string = 'Cargando...';
  private userSubscription!: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
   
    this.userSubscription = this.auth.currentUserProfile.subscribe(user => {
      if (user) {
        // Si hay un usuario, actualizamos el nombre
        this.nombreUsuario = user.nombre;
      } else {
        // Si no (o al cerrar sesión), volvemos a un valor por defecto
        this.nombreUsuario = 'Usuario';
      }
    });
  }

  ngOnDestroy() {
    // Importante: Limpiar la suscripción para evitar fugas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

 
  async cerrarSesion() {
    await this.auth.logout();
    // Redirigir al login después de cerrar sesión
    this.navCtrl.navigateRoot(['/login']);
  }

}