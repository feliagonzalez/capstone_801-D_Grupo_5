import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  createUserWithEmailAndPassword, 
  UserCredential,
  signInWithEmailAndPassword,  
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'; 
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore'; 
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment'; // 1. IMPORTAR EL ENTORNO

export interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private app: FirebaseApp;
  
  
  public auth: Auth;
  public db: Firestore;

  public currentUserProfile = new BehaviorSubject<UserProfile | null>(null);
  public currentUserId: string | null = null;

  constructor() {
    
    this.app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

   
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUserId = user.uid; 
        this.fetchUserProfile(user.uid);
      } else {
        this.currentUserId = null; 
        this.currentUserProfile.next(null);
      }
    });
  }

  
  async fetchUserProfile(uid: string) {
    const userDocRef = doc(this.db, 'usuarios', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      console.log("Perfil de usuario encontrado:", docSnap.data());
      this.currentUserProfile.next(docSnap.data() as UserProfile);
    } else {
      console.error("No se encontraron datos de perfil para el usuario:", uid);
      this.currentUserProfile.next(null); 
    }
  }

  /**
   * Registra un nuevo usuario y guarda sus datos en Firestore.
   */
  async register(usuario: string, email: string, contrasena: string): Promise<boolean> {
    
    try {
      // 1. Crear el usuario en "Authentication"
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        contrasena
      );
      const user = userCredential.user;

      if (user) {
        
        const userDocRef = doc(this.db, 'usuarios', user.uid);
        
        
        const profile: UserProfile = {
          uid: user.uid,
          nombre: usuario, 
          email: user.email! 
        };
        await setDoc(userDocRef, profile);

        console.log('Usuario registrado y datos guardados en Firestore.');
        return true;
      }
      
      return false; 

    } catch (error: any) {
      console.error('Error en el registro:', error.code, error.message);
      return false;
    }
  }

  /**
   * Inicia sesión de un usuario con email y contraseña.
   */
  async login(email: string, contrasena: string): Promise<boolean> {
    
    try {
      // Iniciar sesión en Firebase Authentication
      await signInWithEmailAndPassword(
        this.auth,
        email,
        contrasena
      );
      
      
      console.log('Login exitoso.');
      return true; // El login fue exitoso

    } catch (error: any) {
      console.error('Error en el login:', error.code, error.message);
      return false;
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Sesión cerrada exitosamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}