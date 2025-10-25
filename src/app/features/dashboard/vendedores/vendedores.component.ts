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
import { RegistrarVendedorComponent } from './registrar-vendedor/registrar-vendedor.component';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { Vendedor } from '../../../core/models/vendedor.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendedores',
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
  templateUrl: './vendedores.component.html',
  styleUrl: './vendedores.component.scss'
})
export class VendedoresComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'contacto', 'zona', 'estado', 'acciones'];
  vendedores: Vendedor[] = [];
  
  // Filtros
  searchTerm = '';
  selectedZona = '';
  selectedEstado = '';
  
  // Paginación
  page = 1;
  size = 10;
  total = 0;
  
  // Estados
  isLoading = false;
  errorMessage = '';
  
  // Listas para filtros
  zonas = [
    { value: '', label: 'Seleccione Zona' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'México', label: 'México' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Perú', label: 'Perú' }
  ];
  
  estados = [
    { value: '', label: 'Seleccione Estado' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
  ];

  constructor(
    private readonly dialog: MatDialog,
    private readonly vendedorService: VendedorHttpService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly paginatorIntl: MatPaginatorIntl
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
    this.inicializarFiltros();
    this.configurarPaginador();
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
   * Inicializa las opciones de filtros con traducciones
   */
  private inicializarFiltros(): void {
    this.zonas = [
      { value: '', label: this.translate.instant('VENDEDORES.FILTERS.SELECT_ZONE') },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'México', label: 'México' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Perú', label: 'Perú' }
    ];
    
    this.estados = [
      { value: '', label: this.translate.instant('VENDEDORES.FILTERS.SELECT_STATUS') },
      { value: 'Activo', label: this.translate.instant('VENDEDORES.STATUS.ACTIVE') },
      { value: 'Inactivo', label: this.translate.instant('VENDEDORES.STATUS.INACTIVE') }
    ];
  }

  /**
   * Carga la lista de vendedores desde el backend con filtros
   */
  cargarVendedores(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.page = 1;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const params: any = {
      page: this.page,
      size: this.size
    };

    // Solo agregar filtros si tienen valores válidos
    if (this.searchTerm?.trim()) {
      params.nombre = this.searchTerm.trim();
    }
    if (this.selectedZona && this.selectedZona !== '') {
      params.zona = this.selectedZona;
    }
    if (this.selectedEstado && this.selectedEstado !== '') {
      params.estado = this.selectedEstado;
    }

    this.vendedorService.obtenerVendedores(params)
      .subscribe({
        next: (response) => {
          this.vendedores = response.items;
          this.page = response.page;
          this.total = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar vendedores:', error);
          this.errorMessage = 'Error al cargar los vendedores. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.snackBar.open('Error al cargar vendedores', 'Cerrar', { duration: 5000 });
        }
      });
  }

  /**
   * Aplica los filtros y recarga desde el backend
   */
  aplicarFiltros(): void {
    this.cargarVendedores(true);
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.cargarVendedores();
  }

  /**
   * Abre el modal para registrar un nuevo vendedor
   */
  openRegistrarVendedorDialog(): void {
    const dialogRef = this.dialog.open(RegistrarVendedorComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Vendedor registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarVendedores();
      }
    });
  }

  /**
   * Edita un vendedor existente
   */
  editarVendedor(vendedor: Vendedor): void {
    console.log('Editar vendedor:', vendedor);
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedZona = '';
    this.selectedEstado = '';
    this.cargarVendedores(true);
  }

  /**
   * Retorna true si hay vendedores disponibles
   */
  get tieneVendedores(): boolean {
    return this.vendedores.length > 0;
  }

  /**
   * Retorna true si hay filtros activos
   */
  get hasFiltrosActivos(): boolean {
    return !!(this.searchTerm || this.selectedZona || this.selectedEstado);
  }

  /**
   * Retorna el estilo de chip según el estado
   */
  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }
}
