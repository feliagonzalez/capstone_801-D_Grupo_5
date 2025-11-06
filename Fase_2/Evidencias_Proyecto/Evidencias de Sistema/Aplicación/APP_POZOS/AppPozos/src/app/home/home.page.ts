import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Necesitas Router para la navegación
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  standalone: true, 
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  
  selector: 'app-home',
  templateUrl: 'home.page.html',  // Usará el nuevo HTML de menú
  styleUrls: ['home.page.scss'],
})
export class HomePage { // No necesitamos OnInit si no cargamos datos
  
  // Variables para la interfaz de menú
  userName: string = 'Ana'; // Puedes obtener esto de un servicio de autenticación

  // Asegúrate de inyectar el Router
  constructor(private router: Router) {}

  // Lógica para cerrar la sesión (vinculada al botón en el HTML)
  cerrarSesion() {
    console.log('Cerrando sesión...');
    // **AÑADE AQUÍ TU LÓGICA DE CIERRE DE SESIÓN (ej. eliminar tokens)**

    // Navega a la página de login o a la raíz después de cerrar sesión
    this.router.navigate(['/login']); // Cambia '/login' a tu ruta de inicio de sesión
  }

  // Puedes añadir funciones de navegación específicas para cada tarjeta
  navegarADashboard() {
    this.router.navigate(['/dashboard']); 
  }

  // El resto de la lógica de carga de pozos (pozos: Pozo[], loading: boolean, cargarPozos()) se ELIMINA
}