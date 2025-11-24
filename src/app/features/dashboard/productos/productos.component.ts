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
import { RegistrarProductoComponent } from './registrar-producto/registrar-producto.component';
import { CargaMasivaProductosComponent } from './carga-masiva-productos/carga-masiva-productos.component';
import { InventariosPorBodegaDialogComponent } from './inventarios-por-bodega-dialog/inventarios-por-bodega-dialog.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component';
import { ProductoHttpService } from '../../../core/services/producto-http.service';
import { Producto } from '../../../core/models/producto.models';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-productos',
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
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'codigo_sku', 'precio_unitario', 'estado', 'acciones'];
  productos: Producto[] = [];
  
  // Filtros
  searchTerm = '';
  selectedCategoria = '';
  selectedEstado = '';
  
  // Paginación
  page = 1;
  size = 10;
  total = 0;
  
  // Estados
  isLoading = false;
  isSearching = false;
  errorMessage = '';
  
  // Listas para filtros (se configuran en ngOnInit con traducciones)
  categorias: Array<{ value: string; label: string }> = [];
  estados: Array<{ value: string; label: string }> = [];

  // Subject para manejar debounce en búsqueda
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly productoService: ProductoHttpService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly paginatorIntl: MatPaginatorIntl
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.inicializarFiltros();
    this.configurarPaginador();
    this.configurarCategorias();
    this.configurarEstados();
    this.configurarBusquedaConDebounce();
  }

  /**
   * Configura el debounce para la búsqueda
   */
  private configurarBusquedaConDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.searchTerm?.trim()) {
        this.isSearching = true;
        this.cargarProductos(true, false); // No mostrar loading para mantener el foco
      } else {
        // Si está vacío, solo limpiar sin hacer petición al servidor
        this.isSearching = false;
        if (!this.selectedCategoria && !this.selectedEstado) {
          this.cargarProductos(true, false);
        }
      }
    });
  }

  /**
   * Configura las categorías con traducciones
   */
  private configurarCategorias(): void {
    this.categorias = [
      { value: '', label: this.translate.instant('PRODUCTOS.FILTERS.SELECT_CATEGORY') },
      { value: 'medicamento', label: this.translate.instant('PRODUCTOS.CATEGORIES.MEDICAMENTO') },
      { value: 'insumo', label: this.translate.instant('PRODUCTOS.CATEGORIES.INSUMO') },
      { value: 'reactivo', label: this.translate.instant('PRODUCTOS.CATEGORIES.REACTIVO') },
      { value: 'dispositivo', label: this.translate.instant('PRODUCTOS.CATEGORIES.DISPOSITIVO') }
    ];
  }

  /**
   * Configura los estados con traducciones
   */
  private configurarEstados(): void {
    this.estados = [
      { value: '', label: this.translate.instant('PRODUCTOS.FILTERS.SELECT_STATUS') },
      { value: 'Activo', label: this.translate.instant('PRODUCTOS.STATUS.ACTIVE') },
      { value: 'Inactivo', label: this.translate.instant('PRODUCTOS.STATUS.INACTIVE') }
    ];
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
    this.categorias = [
      { value: '', label: this.translate.instant('PRODUCTOS.FILTERS.SELECT_CATEGORY') },
      { value: 'medicamento', label: this.translate.instant('PRODUCTOS.CATEGORIES.MEDICINE') },
      { value: 'insumo', label: this.translate.instant('PRODUCTOS.CATEGORIES.SUPPLY') },
      { value: 'equipo', label: this.translate.instant('PRODUCTOS.CATEGORIES.EQUIPMENT') }
    ];
    
    this.estados = [
      { value: '', label: this.translate.instant('PRODUCTOS.FILTERS.SELECT_STATUS') },
      { value: 'Activo', label: this.translate.instant('PRODUCTOS.STATUS.ACTIVE') },
      { value: 'Inactivo', label: this.translate.instant('PRODUCTOS.STATUS.INACTIVE') }
    ];
  }

  /**
   * Carga la lista de productos desde el backend con filtros
   */
  cargarProductos(resetearPagina: boolean = false, mostrarLoading: boolean = true): void {
    if (resetearPagina) {
      this.page = 1;
    }

    if (mostrarLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    const params: any = {
      page: this.page,
      size: this.size
    };

    // Solo agregar filtros si tienen valores válidos
    if (this.searchTerm?.trim()) {
      params.buscar = this.searchTerm.trim();
    }
    if (this.selectedCategoria && this.selectedCategoria !== '') {
      params.categoria = this.selectedCategoria;
    }
    if (this.selectedEstado && this.selectedEstado !== '') {
      params.estado = this.selectedEstado;
    }

    this.productoService.obtenerProductos(params)
      .subscribe({
        next: (response) => {
          this.productos = response.data.productos;
          this.page = response.data.paginacion.pagina_actual;
          this.total = response.data.paginacion.total_productos;
          this.isLoading = false;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.errorMessage = 'Error al cargar los productos. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.isSearching = false;
          this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 5000 });
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
    this.cargarProductos(true);
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.cargarProductos();
  }

  /**
   * Abre el modal para registrar un nuevo producto
   * H-7: Flexibilidad y eficiencia de uso - Acción principal destacada
   */
  openRegistrarProductoDialog(): void {
    const dialogRef = this.dialog.open(RegistrarProductoComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Producto registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProductos();
      }
    });
  }

  /**
   * Abre el modal para carga masiva de productos
   */
  openCargaMasivaDialog(): void {
    const dialogRef = this.dialog.open(CargaMasivaProductosComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.reload) {
        this.snackBar.open('Carga masiva completada', 'Cerrar', { duration: 3000 });
        this.cargarProductos();
      }
    });
  }

  /**
   * Abre el modal para consultar inventarios por bodega
   */
  openInventariosPorBodegaDialog(): void {
    // Lazy import del componente para mantener performance si se requiere en el futuro
    const dialogRef = this.dialog.open(InventariosPorBodegaDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      // No se requiere acción al cerrar por ahora
    });
  }

  /**
   * Edita un producto existente
   */
  editarProducto(producto: Producto): void {
    console.log('Editar producto:', producto);
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', { duration: 2000 });
  }

  /**
   * Abre el diálogo con el detalle del producto
   */
  verDetalleProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(DetalleProductoComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        productoId: producto.id
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // No necesita recargar la lista al cerrar el detalle
    });
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedCategoria = '';
    this.selectedEstado = '';
    this.cargarProductos(true);
  }

  /**
   * Retorna true si hay productos disponibles
   */
  get tieneProductos(): boolean {
    return this.productos.length > 0;
  }

  /**
   * Retorna true si hay filtros activos
   */
  get hasFiltrosActivos(): boolean {
    return !!(this.searchTerm || this.selectedCategoria || this.selectedEstado);
  }

  /**
   * Retorna el estilo de chip según el estado
   */
  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  /**
   * Formatea el precio como moneda
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}
