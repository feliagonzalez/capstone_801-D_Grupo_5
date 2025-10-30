// src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface Pozo {
  nombre: string;
  ubicacion?: string;
  activo?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Lectura {
  nivelAgua: number;
  caudal?: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private db: AngularFireDatabase) {}

  // ====== POZOS ======
  pozos$(): Observable<Array<Pozo & { id: string }>> {
    return this.db
      .list<Pozo>('pozos')
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ id: c.payload.key!, ...(c.payload.val() as Pozo) }))
        )
      );
  }

  async addPozo(data: Pozo) {
    const now = Date.now();
    const ref = await this.db.list('pozos').push({
      ...data,
      activo: data.activo ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return ref.key!;
  }

  updatePozo(id: string, data: Partial<Pozo>) {
    const now = Date.now();
    return this.db.object(`pozos/${id}`).update({ ...data, updatedAt: now });
  }

  async deletePozo(id: string) {
    await this.db.object(`pozos/${id}`).remove();
    await this.db.list(`lecturas/${id}`).remove();
  }

  // ====== LECTURAS ======
  lecturasLive$(pozoId: string, ultimasN = 50): Observable<Array<Lectura & { id: string }>> {
    return this.db
      .list<Lectura>(`lecturas/${pozoId}`, ref => ref.limitToLast(ultimasN))
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes
            .map(c => ({ id: c.payload.key!, ...(c.payload.val() as Lectura) }))
            .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
        )
      );
  }

  getLecturasOnce(pozoId: string) {
    return this.lecturasLive$(pozoId, 1_000_000).pipe(take(1));
  }

  async addLectura(
    pozoId: string,
    lectura: Omit<Lectura, 'timestamp'> & { timestamp?: number }
  ) {
    const payload: Lectura = { timestamp: Date.now(), ...lectura } as Lectura;
    const ref = await this.db.list(`lecturas/${pozoId}`).push(payload);
    return ref.key!;
  }

  deleteLectura(pozoId: string, lecturaId: string) {
    return this.db.object(`lecturas/${pozoId}/${lecturaId}`).remove();
  }
}
