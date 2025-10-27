import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simulación de una base de datos de usuarios para la demo
  private demoUsers: { usuario: string, email: string, contrasena: string }[] = [];

  constructor() {
    // Inicializa con algunos datos de prueba si quieres
    this.demoUsers.push({
      usuario: 'testuser',
      email: 'test@example.com',
      contrasena: 'password123'
    });
  }

  /**
   * Intenta registrar un nuevo usuario.
   * @param usuario Nombre de usuario.
   * @param email Correo electrónico.
   * @param contrasena Contraseña.
   * @returns Una promesa que resuelve a 'true' si el registro es exitoso, 'false' si el email ya existe.
   */
  register(usuario: string, email: string, contrasena: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulación de llamada a backend con retardo
      setTimeout(() => {
        // 1. Verificar si el email ya está en uso
        const emailExists = this.demoUsers.some(user => user.email === email);
        if (emailExists) {
          // El email ya existe, no se puede registrar
          resolve(false); 
          return;
        }

        // 2. Simulación de registro exitoso
        if (usuario && email && contrasena) {
          this.demoUsers.push({ usuario, email, contrasena });
          console.log('Usuario registrado:', { usuario, email });
          
          // Opcional: Iniciar sesión automáticamente después del registro
          // localStorage.setItem('token', 'demo-token-' + email); 
          
          resolve(true);
        } else {
          // Si faltan datos (aunque el formulario HTML debería prevenir esto)
          resolve(false);
        }
      }, 700);
    });
  }

  // El resto de tus métodos quedan igual:
  
  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Demo: Buscar en nuestra lista de usuarios simulada
      setTimeout(() => {
        const user = this.demoUsers.find(
          u => u.email === email && u.contrasena === password
        );
        
        if (user) {
          localStorage.setItem('token', 'demo-token-' + email);
          resolve(true);
        } else {
          // Si no se encuentra o las credenciales son incorrectas
          resolve(false);
        }
      }, 700);
    });
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}