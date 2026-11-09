import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Tarea } from '../modelos/tarea';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/tareas';

  private readonly _tareas = signal<Tarea[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly tareas = this._tareas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly total = computed(() => this._tareas().length);
  readonly completadas = computed(() => this._tareas().filter(t => t.estado).length);
  readonly pendientes = computed(() => this.total() - this.completadas());

  cargar(): void {
    this._cargando.set(true);
    this._error.set(null);
    this.http.get<Tarea[]>(this.url).subscribe({
      next: tareas => {
        this._tareas.set(tareas);
        this._cargando.set(false);
      },
      error: () => {
        this._error.set('No se pudieron cargar las tareas');
        this._cargando.set(false);
      },
    });
  }

  obtener(id: number): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.url}/${id}`);
  }

  agregar(titulo: string): Observable<Tarea> {
    const nueva: Omit<Tarea, 'id'> = { titulo, estado: false };
    return this.http.post<Tarea>(this.url, nueva).pipe(
      tap(creada => this._tareas.update(lista => [...lista, creada]))
    );
  }

  actualizar(tarea: Tarea): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.url}/${tarea.id}`, tarea).pipe(
      tap(act => this._tareas.update(lista => lista.map(t => (t.id === act.id ? act : t))))
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this._tareas.update(lista => lista.filter(t => t.id !== id)))
    );
  }

  alternarCompletada(tarea: Tarea): Observable<Tarea> {
    return this.actualizar({ ...tarea, estado: !tarea.estado });
  }

  editarTitulo(tarea: Tarea, titulo: string): Observable<Tarea> {
    return this.actualizar({ ...tarea, titulo });
  }

}
