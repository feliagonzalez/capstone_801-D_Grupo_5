import { Injectable } from '@angular/core';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  onSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service'; // --- 2. Importar AuthService ---

// Define la estructura de tu configuración
export interface ConfigGlobal {
  activada: boolean;
  umbralBajo: number;
  umbralAlto: number;
}

// VALORES POR DEFECTO (si no hay nada en la BD)
const VALORES_POR_DEFECTO: ConfigGlobal = {
  activada: true,
  umbralBajo: 30,
  umbralAlto: 50
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  
  private db: Firestore; 
  
  private configSubject = new BehaviorSubject<ConfigGlobal>(VALORES_POR_DEFECTO);
  public onSettingsChange = this.configSubject.asObservable();

  // 4. Inyectar AuthService
  constructor(private authService: AuthService) {
   
    this.db = this.authService.db;

    
    this.escucharCambiosDeConfiguracion();
  }

  
  private escucharCambiosDeConfiguracion() {
   
    const configDocRef = doc(this.db, 'configuracion', 'global');
    
    onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
       
        console.log('Datos de configuración recibidos de Firestore:', docSnap.data());
        this.configSubject.next(docSnap.data() as ConfigGlobal);
      } else {
        
        console.log('No hay config en Firestore, usando valores por defecto.');
        this.configSubject.next(VALORES_POR_DEFECTO);
      }
    });
  }

  
  async saveSettings(config: ConfigGlobal) {
    const configDocRef = doc(this.db, 'configuracion', 'global');
    await setDoc(configDocRef, config);
    console.log('Configuración guardada en Firestore.');
  }
}