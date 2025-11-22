import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';
import { RegistrarRutaComponent } from './registrar-ruta/registrar-ruta.component';
import { RutaHttpService } from '../../../core/services/ruta-http.service';
import { Ruta, Zona } from '../../../core/models/ruta.models';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.scss'
})
export class RutasComponent implements OnInit {
  rutas: Ruta[] = [];
  zonas: Zona[] = [];
  displayedColumns: string[] = ['id', 'camion', 'zona', 'bodega', 'estado', 'fecha_asignacion', 'acciones'];
  
  // Filtros
  selectedZonaId = '';
  selectedEstado = '';
  
  // Opciones de filtros
  estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];
  
  // Paginación
  page = 1;
  size = 10;
  total = 0;
  
  // Estados de carga
  isLoading = false;
  isLoadingZonas = false;
  errorMessage = '';
  
  // Subject para debounce de búsqueda
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly rutaHttpService: RutaHttpService
  ) {}

  ngOnInit(): void {
    this.cargarZonas();
    this.cargarRutas();
    this.setupSearchDebounce();
  }

  /**
   * Configura el debounce para el campo de búsqueda
   */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.page = 1;
      this.cargarRutas();
    });
  }

  /**
   * Aplica los filtros
   */
  aplicarFiltros(): void {
    this.page = 1;
    this.cargarRutas();
  }

  /**
   * Carga la lista de zonas para el filtro
   */
  cargarZonas(): void {
    this.isLoadingZonas = true;
    this.rutaHttpService.obtenerZonas().subscribe({
      next: (response) => {
        this.zonas = response.data || [];
        this.isLoadingZonas = false;
      },
      error: (error) => {
        console.error('Error al cargar zonas:', error);
        this.isLoadingZonas = false;
      }
    });
  }

  /**
   * Carga las rutas con filtros y paginación
   */
  cargarRutas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params: { [key: string]: string | number } = {
      page: this.page,
      size: this.size
    };

    if (this.selectedZonaId) {
      params['zona_id'] = this.selectedZonaId;
    }

    if (this.selectedEstado) {
      params['estado'] = this.selectedEstado;
    }

    this.rutaHttpService.obtenerRutas(params).subscribe({
      next: (response) => {
        this.rutas = response.data;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar rutas:', error);
        this.errorMessage = 'Error al cargar las rutas';
        this.isLoading = false;
        
        this.snackBar.open(
          'Error al cargar las rutas',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  /**
   * Limpia los filtros aplicados
   */
  limpiarFiltros(): void {
    this.selectedZonaId = '';
    this.selectedEstado = '';
    this.page = 1;
    this.cargarRutas();
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.cargarRutas();
  }

  /**
   * Abre el diálogo para registrar una nueva ruta
   */
  openRegistrarRutaDialog(): void {
    const dialogRef = this.dialog.open(RegistrarRutaComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Ruta registrada:', result);
        this.cargarRutas(); // Recargar la lista
      }
    });
  }

  /**
   * Verifica si hay filtros activos
   */
  get hasFiltrosActivos(): boolean {
    return !!(this.selectedZonaId || this.selectedEstado);
  }

  /**
   * Verifica si hay rutas disponibles
   */
  get tieneRutas(): boolean {
    return this.rutas.length > 0;
  }

  /**
   * Obtiene la clase CSS para el chip de estado
   */
  getEstadoClass(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en_progreso':
        return 'estado-en-progreso';
      case 'completada':
        return 'estado-completada';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return '';
    }
  }

  /**
   * Formatea el estado para mostrar
   */
  formatearEstado(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'en_progreso':
        return 'En Progreso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  }
}
