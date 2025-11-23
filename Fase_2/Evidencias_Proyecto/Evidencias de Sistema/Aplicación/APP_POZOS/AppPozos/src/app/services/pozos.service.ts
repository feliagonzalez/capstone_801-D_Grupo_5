import { Injectable } from '@angular/core';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc,
  collection,
  serverTimestamp,
  query,
  onSnapshot,
  updateDoc
} from 'firebase/firestore'; 
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Pozo {
  id?: string; 
  nombre: string;
  
  // Campos para el mapa
  latitud?: number | null;  
  longitud?: number | null; 
  
  profundidadTotal: number | null;
  diametro?: number | null;
  vidaUtilRestante: number | null;
  fechaInstalacion: string; 

  activo: boolean;
  fechaCreacion?: any; 
  uidUsuario?: string; 

  // Configuración
  configEspecificaActiva?: boolean;
  configUmbralBajo?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PozosService {

  private db: Firestore;
  private pozosSubject = new BehaviorSubject<Pozo[]>([]);
  public pozosDelUsuario$: Observable<Pozo[]> = this.pozosSubject.asObservable();

  constructor(
    private authService: AuthService
  ) { 
    this.db = this.authService.db;

    this.authService.currentUserProfile.subscribe(user => {
      if (user && user.uid) {
        this.escucharPozosDelUsuario(user.uid);
      } else {
        this.pozosSubject.next([]);
      }
    });
  }

  private escucharPozosDelUsuario(userId: string) {
    const pozosCollectionRef = collection(this.db, 'usuarios', userId, 'pozos');
    const q = query(pozosCollectionRef); 

    onSnapshot(q, (snapshot) => {
      const pozosList: Pozo[] = [];
      snapshot.forEach(doc => {
        
        const data = doc.data() as Partial<Pozo>; 

        const defaults = {
          configEspecificaActiva: false,
          configUmbralBajo: 30
        };

        const pozoConDefaults: Pozo = {
          ...defaults,
          ...data,
          
          id: doc.id,
          nombre: data.nombre || 'Pozo sin nombre',
          latitud: data.latitud || null,
          longitud: data.longitud || null,
          profundidadTotal: data.profundidadTotal || null,
          diametro: data.diametro || null,
          vidaUtilRestante: data.vidaUtilRestante || null,
          fechaInstalacion: data.fechaInstalacion || '',
          activo: data.activo ?? true,
          fechaCreacion: data.fechaCreacion || null,
          uidUsuario: data.uidUsuario || userId
        };
        
        pozosList.push(pozoConDefaults);
      });
      this.pozosSubject.next(pozosList);
      console.log('Pozos cargados:', pozosList);
    }, (error) => {
      console.error("Error al escuchar pozos:", error);
      this.pozosSubject.next([]); 
    });
  }

  
  async agregarPozo(pozoData: Pozo): Promise<string | null> {
    
    const userId = this.authService.currentUserId;
    if (!userId) {
      console.error("No hay usuario logueado.");
      return null;
    }

    try {
      const pozosCollectionRef = collection(this.db, 'usuarios', userId, 'pozos');
      const nuevoPozoRef = doc(pozosCollectionRef); 

    
      const dataToSave = {
        ...pozoData,
        fechaCreacion: serverTimestamp(),
        uidUsuario: userId,
       
        latitud: pozoData.latitud || null,
        longitud: pozoData.longitud || null
      };

      await setDoc(nuevoPozoRef, dataToSave);

      console.log('Pozo creado:', nuevoPozoRef.id);
      return nuevoPozoRef.id; 

    } catch (error) {
      console.error('Error al crear el pozo:', error);
      return null;
    }
  }

  // --- ACTUALIZAR POZO ---
  async updatePozo(pozo: Pozo): Promise<boolean> {
    const userId = this.authService.currentUserId;
    
    if (!userId || !pozo.id) {
      console.error("Error: Falta usuario o ID.");
      return false;
    }

    try {
      const pozoDocRef = doc(this.db, 'usuarios', userId, 'pozos', pozo.id);

     
      const dataToUpdate = {
        configEspecificaActiva: pozo.configEspecificaActiva,
        configUmbralBajo: pozo.configUmbralBajo,
        activo: pozo.activo
      };
      
      await updateDoc(pozoDocRef, dataToUpdate);
      console.log('Pozo actualizado:', pozo.id);
      return true;

    } catch (error) {
      console.error('Error al actualizar:', error);
      return false;
    }
  }
}