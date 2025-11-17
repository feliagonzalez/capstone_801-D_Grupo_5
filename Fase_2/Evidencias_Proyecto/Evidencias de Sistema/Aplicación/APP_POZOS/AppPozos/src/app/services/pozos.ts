import { Injectable } from '@angular/core';

import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore'; 
import { AuthService } from './auth.service'; // Importamos AuthService


export interface Pozo {
  id?: string;
  nombre: string;
  latitud: number | null;
  longitud: number | null;
  profundidadTotal: number | null;
  diametro: number | null;
  nivelEstaticoInicial: number | null;
  activo: boolean;
  fechaCreacion: any;
  uidUsuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class PozosService {

  
  private db: Firestore; // Solo necesitamos la BD
 

  constructor(
    private authService: AuthService
  ) { 
    
    this.db = this.authService.db;
    
  }

  async crearPozo(pozoData: Pozo): Promise<string | null> {
    
    
    const userId = this.authService.currentUserId;
    if (!userId) {
      console.error('Error: No hay usuario logueado para crear el pozo.');
      return null;
    }

    try {
      
      const pozosCollectionRef = collection(this.db, 'usuarios', userId, 'pozos');
      
      
      const nuevoPozoRef = doc(pozosCollectionRef); 

      
      pozoData.id = nuevoPozoRef.id;
      pozoData.fechaCreacion = serverTimestamp();
      pozoData.uidUsuario = userId;

     
      await setDoc(nuevoPozoRef, pozoData);

      console.log('Pozo registrado exitosamente con ID:', nuevoPozoRef.id);
      return nuevoPozoRef.id; 

    } catch (error) {
      console.error('Error al crear el pozo:', error);
      return null;
    }
  }

}