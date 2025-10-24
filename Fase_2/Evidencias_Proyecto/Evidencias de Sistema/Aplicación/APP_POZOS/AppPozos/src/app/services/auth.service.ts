import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Demo: aceptar cualquier credencial no vacía.
      // Reemplazar por llamada real al backend si es necesario.
      setTimeout(() => {
        if (email && password) {
          localStorage.setItem('token', 'demo-token');
          resolve(true);
        } else {
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
