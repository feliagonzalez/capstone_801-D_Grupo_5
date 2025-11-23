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
import { AuthService } from './auth.service'; 


export interface ConfigGlobal {
  activada: boolean;
  umbralBajo: number;
  umbralAlto: number;
  notificaciones?: { 
    email: boolean;
    push: boolean;
    wsp: boolean;
    sms: boolean;          // ✅ nueva propiedad
    numeroWsp?: string;
    numeroSms?: string;    // ✅ nueva propiedad
  };
}


const VALORES_POR_DEFECTO: ConfigGlobal = {
  activada: true,
  umbralBajo: 30,
  umbralAlto: 50,
  notificaciones: {
    email: true,
    push: false,
    wsp: false,
    sms: false  // ✅ agregado aquí
  }
};



@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  

  private db: Firestore; 
  
  private configSubject = new BehaviorSubject<ConfigGlobal>(VALORES_POR_DEFECTO);
  public onSettingsChange = this.configSubject.asObservable();

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

  // ============================================================
//  ENVÍO DE SMS (API DE PRUEBA - TEXTBELT)
// ============================================================
async sendSms(numero: string, mensaje: string) {
  const apiUrl = "https://textbelt.com/text";
  const apiKey = "textbelt"; // Clave gratuita de prueba

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: numero,
        message: mensaje,
        key: apiKey
      })
    });

    const result = await response.json();
    console.log("Respuesta completa de Textbelt:", result);

    console.log("Resultado envío SMS:", result);

    if (result.success) {
      return true;
    } else {
      throw new Error(result.error || "Error desconocido al enviar SMS");
    }
  } catch (error) {
    console.error("Error al enviar SMS:", error);
    throw error;
  }
}

}