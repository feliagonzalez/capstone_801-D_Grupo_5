import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ⬇️ Define el tipo de dato (opcional pero recomendado)
export interface Pozo {
  id: number;
  nombre: string;
  ubicacion: string;
  caudal: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PozosService {
  // ⬇️ URL de tu API de Flask
  private apiUrl = 'http://10.0.2.2:5000/api/pozos';

  constructor(private http: HttpClient) { }

  // Método para obtener todos los pozos
  getPozos(): Observable<Pozo[]> {
    return this.http.get<Pozo[]>(this.apiUrl);
  }

  // Método para obtener un pozo por ID
  getPozo(id: number): Observable<Pozo> {
    return this.http.get<Pozo>(`${this.apiUrl}/${id}`);
  }
}