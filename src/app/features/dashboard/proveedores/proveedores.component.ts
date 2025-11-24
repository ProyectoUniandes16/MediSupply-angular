import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RegistrarProveedorComponent } from './registrar-proveedor/registrar-proveedor.component';
import { ProveedorHttpService } from '../../../core/services/proveedor-http.service';
import { RutaHttpService } from '../../../core/services/ruta-http.service';
import { Proveedor, Paginacion } from '../../../core/models/proveedor.models';
import { Zona } from '../../../core/models/ruta.models';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule
  ],
  providers: [MatPaginatorIntl],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'pais', 'estado', 'contacto', 'acciones'];
  proveedores: Proveedor[] = [];
  
  // Filtros
  searchTerm = '';
  selectedPais = 'Todos';
  selectedEstado = 'Todos';
  
  // Paginación
  paginacion: Paginacion = {
    pagina: 1,
    por_pagina: 20,
    total: 0,
    total_paginas: 0
  };
  
  // Estados
  isLoading = false;
  isLoadingZonas = false;
  isSearching = false;
  errorMessage = '';
  
  // Listas para filtros
  paises: { value: string; label: string }[] = [];
  zonas: Zona[] = [];
  
  estados = [
    { value: '', label: 'Todos' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
  ];

  // Subject para manejar debounce en búsqueda
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly proveedorService: ProveedorHttpService,
    private readonly rutaHttpService: RutaHttpService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly paginatorIntl: MatPaginatorIntl
  ) {}

  ngOnInit(): void {
    this.cargarZonas();
    this.cargarProveedores();
    this.inicializarFiltros();
    this.configurarPaginador();
    this.configurarBusquedaConDebounce();
  }

  /**
   * Configura el debounce para la búsqueda
   */
  private configurarBusquedaConDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
      distinctUntilChanged() // Solo emitir si el valor cambió
    ).subscribe(() => {
      if (this.searchTerm?.trim()) {
        this.isSearching = true;
        this.cargarProveedores(true, false); // No mostrar loading general para mantener el foco
      } else {
        // Si está vacío, solo limpiar sin hacer petición al servidor
        this.isSearching = false;
        if (this.selectedPais === 'Todos' && this.selectedEstado === 'Todos') {
          this.cargarProveedores(true, false);
        }
      }
    });
  }

  /**
   * Configura las traducciones del paginador
   */
  private configurarPaginador(): void {
    this.actualizarEtiquetasPaginador();
    // Suscribirse a cambios de idioma solo una vez
    this._paginatorLangSub ??= this.translate.onLangChange.subscribe(() => {
      this.actualizarEtiquetasPaginador();
    });
  }

  private _paginatorLangSub?: Subscription;

  private actualizarEtiquetasPaginador(): void {
    this.paginatorIntl.itemsPerPageLabel = this.translate.instant('COMMON.PAGINATOR.ITEMS_PER_PAGE');
    this.paginatorIntl.nextPageLabel = this.translate.instant('COMMON.PAGINATOR.NEXT_PAGE');
    this.paginatorIntl.previousPageLabel = this.translate.instant('COMMON.PAGINATOR.PREVIOUS_PAGE');
    this.paginatorIntl.firstPageLabel = this.translate.instant('COMMON.PAGINATOR.FIRST_PAGE');
    this.paginatorIntl.lastPageLabel = this.translate.instant('COMMON.PAGINATOR.LAST_PAGE');

    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return this.translate.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_1', { length });
      }
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.instant('COMMON.PAGINATOR.RANGE_PAGE_LABEL_2', {
        startIndex: startIndex + 1,
        endIndex,
        length
      });
    };
    // Notificar cambios
    this.paginatorIntl.changes.next();
  }

  /**
   * Carga las zonas desde el servicio de rutas
   */
  private cargarZonas(): void {
    this.isLoadingZonas = true;

    this.rutaHttpService.obtenerZonas().subscribe({
      next: (response) => {
        this.zonas = response.data || [];
        // Inicializar la lista de países con las zonas cargadas
        this.paises = [
          { value: '', label: this.translate.instant('PROVEEDORES.FILTERS.ALL_COUNTRIES') || 'Todos' },
          ...this.zonas.map(zona => ({ value: zona.nombre, label: zona.nombre }))
        ];
        this.isLoadingZonas = false;
      },
      error: (error) => {
        console.error('Error al cargar zonas:', error);
        // Si hay error, inicializar con lista vacía
        this.paises = [
          { value: '', label: this.translate.instant('PROVEEDORES.FILTERS.ALL_COUNTRIES') || 'Todos' }
        ];
        this.isLoadingZonas = false;
      }
    });
  }

  /**
   * Inicializa las opciones de filtros con traducciones
   */
  private inicializarFiltros(): void {
    // Los países se cargan desde cargarZonas()
    
    this.estados = [
      { value: '', label: this.translate.instant('PROVEEDORES.FILTERS.ALL_STATUSES') || 'Todos' },
      { value: 'Activo', label: this.translate.instant('PROVEEDORES.STATUS.ACTIVE') || 'Activo' },
      { value: 'Inactivo', label: this.translate.instant('PROVEEDORES.STATUS.INACTIVE') || 'Inactivo' }
    ];
  }

  /**
   * Carga la lista de proveedores desde el backend con filtros
   */
  cargarProveedores(resetearPagina: boolean = false, mostrarLoading: boolean = true): void {
    if (resetearPagina) {
      this.paginacion.pagina = 1;
    }

    if (mostrarLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    const params: any = {
      pagina: this.paginacion.pagina,
      por_pagina: this.paginacion.por_pagina
    };

    // Solo agregar filtros si tienen valores válidos
    if (this.searchTerm?.trim()) {
      params.nombre = this.searchTerm.trim();
    }
    if (this.selectedPais && this.selectedPais !== 'Todos' && this.selectedPais !== '') {
      params.pais = this.selectedPais;
    }
    if (this.selectedEstado && this.selectedEstado !== 'Todos' && this.selectedEstado !== '') {
      params.estado = this.selectedEstado;
    }

    this.proveedorService.obtenerProveedores(params)
      .subscribe({
        next: (response) => {
          this.proveedores = response.data;
          // Actualizar solo los valores que vienen del backend, mantener por_pagina del usuario
          this.paginacion.pagina = response.paginacion.pagina;
          this.paginacion.total = response.paginacion.total;
          this.paginacion.total_paginas = response.paginacion.total_paginas;
          // No sobrescribir por_pagina con el del backend para mantener la selección del usuario
          this.isLoading = false;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          this.errorMessage = 'Error al cargar los proveedores. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.isSearching = false;
          this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 5000 });
        }
      });
  }

  /**
   * Maneja cambios en el campo de búsqueda con debounce
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Aplica los filtros y recarga desde el backend
   * Para selectores (sin debounce)
   */
  aplicarFiltros(): void {
    this.cargarProveedores(true);
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.paginacion.pagina = event.pageIndex + 1;
    this.paginacion.por_pagina = event.pageSize;
    this.cargarProveedores();
  }

  /**
   * Abre el modal para registrar un nuevo proveedor
   */
  openRegistrarProveedorDialog(): void {
    const dialogRef = this.dialog.open(RegistrarProveedorComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Proveedor registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProveedores();
      }
    });
  }

  /**
   * Edita un proveedor existente
   */
  editarProveedor(proveedor: Proveedor): void {
    console.log('Editar proveedor:', proveedor);
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedPais = 'Todos';
    this.selectedEstado = 'Todos';
    this.cargarProveedores(true);
  }

  /**
   * Retorna true si hay proveedores disponibles
   */
  get tieneProveedores(): boolean {
    return this.proveedores.length > 0;
  }

  /**
   * Retorna true si hay filtros activos
   */
  get hasFiltrosActivos(): boolean {
    return !!(this.searchTerm || (this.selectedPais && this.selectedPais !== 'Todos' && this.selectedPais !== '') || (this.selectedEstado && this.selectedEstado !== 'Todos' && this.selectedEstado !== ''));
  }

  /**
   * Retorna el estilo de chip según el estado
   */
  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  /**
   * Retorna el estilo de chip según el estado de certificación
   */
  getEstadoCertificacionClass(estado: string): string {
    return estado === 'vigente' ? 'certificacion-vigente' : 'certificacion-vencida';
  }
}
