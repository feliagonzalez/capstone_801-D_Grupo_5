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
  latitud: number | null;
  longitud: number | null;
  profundidadTotal: number | null;
  diametro: number | null;
  vidaUtilRestante: number | null;
  fechaInstalacion: string; 

  activo: boolean;
  fechaCreacion: any; 
  uidUsuario: string; 

  
  configEspecificaActiva: boolean;
  configUmbralBajo: number;
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

        // 2. Unir los defaults con los datos de la BD
        const pozoConDefaults: Pozo = {
          ...defaults, // Aplicar defaults primero
          ...data,     // Sobrescribir con los datos de la BD (si existen)
          
          // Asegurar que los campos obligatorios existan
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
      console.log('Pozos del usuario cargados (con defaults):', pozosList);
    }, (error) => {
      console.error("Error al escuchar la colección de pozos:", error);
      this.pozosSubject.next([]); 
    });
  }
 


  // --- 'crearPozo'  ---
  async crearPozo(pozoData: Pozo): Promise<string | null> {
    
    const userId = this.authService.currentUserId;
    if (!userId) {
      console.error("No hay usuario logueado para crear el pozo.");
      return null;
    }

    try {
      const pozosCollectionRef = collection(this.db, 'usuarios', userId, 'pozos');
      const nuevoPozoRef = doc(pozosCollectionRef); 

      pozoData.fechaCreacion = serverTimestamp(); 
      pozoData.uidUsuario = userId; 

      await setDoc(nuevoPozoRef, pozoData);

      console.log('Pozo creado con ID:', nuevoPozoRef.id);
      return nuevoPozoRef.id; 

    } catch (error) {
      console.error('Error al crear el pozo:', error);
      return null;
    }
  }

  // --- 'updatePozo'  ---
  /**
   * Actualiza un documento de Pozo existente.
   * Se usará para guardar la config. específica desde 'ajustes.page.ts'.
   * @param pozo El objeto Pozo completo con su ID
   */
  async updatePozo(pozo: Pozo): Promise<boolean> {
    const userId = this.authService.currentUserId;
    
    if (!userId || !pozo.id) {
      console.error("No hay usuario o ID de pozo para actualizar.");
      return false;
    }

    try {
      
      const pozoDocRef = doc(this.db, 'usuarios', userId, 'pozos', pozo.id);

     
      const dataToUpdate = {
        configEspecificaActiva: pozo.configEspecificaActiva,
        configUmbralBajo: pozo.configUmbralBajo
        
      };
      
      await updateDoc(pozoDocRef, dataToUpdate);
      console.log('Configuración de pozo actualizada:', pozo.id);
      return true;

    } catch (error) {
      console.error('Error al actualizar el pozo:', error);
      return false;
    }
  }
  // === FIN DE MODIFICACIÓN ===
}