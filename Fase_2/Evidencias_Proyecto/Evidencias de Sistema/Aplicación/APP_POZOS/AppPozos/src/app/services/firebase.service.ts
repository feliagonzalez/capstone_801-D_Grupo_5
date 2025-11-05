import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private db: AngularFireDatabase) {}

  // ====== POZOS ======
  // Stream simple de los pozos (sin IDs)
  pozos$() {
    return this.db.list('pozos').valueChanges();
  }

  // Crear pozo
  async addPozo(data: any) {
    const now = Date.now();
    return this.db.list('pozos').push({
      nombre: data?.nombre ?? 'Sin nombre',
      ubicacion: data?.ubicacion ?? '',
      activo: data?.activo ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Actualizar pozo (requiere la clave del nodo)
  updatePozo(id: string, data: any) {
    const now = Date.now();
    return this.db.object(`pozos/${id}`).update({ ...data, updatedAt: now });
  }

  // Eliminar pozo y sus lecturas
  async deletePozo(id: string) {
    await this.db.object(`pozos/${id}`).remove();
    await this.db.list(`lecturas/${id}`).remove();
  }

  // ====== LECTURAS ======
  // Últimas N lecturas (sin IDs)
  lecturasLive$(pozoId: string, ultimasN = 50) {
    return this.db
      .list(`lecturas/${pozoId}`, (ref: any) => ref.limitToLast(ultimasN))
      .valueChanges();
  }

  // Agregar lectura
  async addLectura(pozoId: string, lectura: any) {
    const payload = {
      nivelAgua: lectura?.nivelAgua ?? 0,
      caudal: lectura?.caudal ?? null,
      timestamp: Date.now(),
    };
    return this.db.list(`lecturas/${pozoId}`).push(payload);
  }

  // Eliminar lectura por ID (clave del nodo)
  deleteLectura(pozoId: string, lecturaId: string) {
    return this.db.object(`lecturas/${pozoId}/${lecturaId}`).remove();
  }
}
