import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Tarea } from '../../modelos/tarea';
import { TareasService } from '../../servicios/tareas';

@Component({
  selector: 'app-detalle-tarea',
  templateUrl: './detalle-tarea.html',
  styleUrls: ['./detalle-tarea.css']
})
export class DetalleTareaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tareasService = inject(TareasService);

  protected readonly tarea = signal<Tarea | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('El ID de la tarea no es válido');
      this.cargando.set(false);
      return;
    }

    this.tareasService.obtener(id).subscribe({
      next: tarea => {
        this.tarea.set(tarea);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(e.status === 404 ? 'La tarea no existe' : 'No se pudo cargar la tarea');
        this.cargando.set(false);
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/tareas']);
  }
}
