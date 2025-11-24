import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AgregarPlanComponent } from './agregar-plan/agregar-plan.component';
import { PlanVentaHttpService } from '../../../core/services/plan-venta-http.service';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { PlanVenta } from '../../../core/models/plan-venta.models';
import { Vendedor } from '../../../core/models/vendedor.models';

@Component({
  selector: 'app-planes-venta',
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
  templateUrl: './planes-venta.component.html',
  styleUrl: './planes-venta.component.scss'
})
export class PlanesVentaComponent implements OnInit {
  planesVenta: PlanVenta[] = [];
  vendedores: Vendedor[] = [];
  displayedColumns: string[] = ['id_plan', 'nombre_plan', 'vendedores', 'meta_ingresos', 'meta_visitas', 'meta_clientes_nuevos', 'estado', 'acciones'];
  
  // Filtros
  searchTerm = '';
  selectedVendedor = '';
  selectedEstado = '';
  
  // Opciones de filtros
  estados = [
    { value: '', label: 'Todos' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' }
  ];
  
  // Paginación
  page = 1;
  size = 10;
  total = 0;
  pages = 0;
  
  // Estados de carga
  isLoading = false;
  isLoadingVendedores = false;
  isSearching = false;
  errorMessage = '';
  
  // Subject para debounce de búsqueda
  private readonly searchSubject = new Subject<string>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly planVentaHttpService: PlanVentaHttpService,
    private readonly vendedorHttpService: VendedorHttpService
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
    this.cargarPlanesVenta();
    this.setupSearchDebounce();
  }

  /**
   * Configura el debounce para el campo de búsqueda
   */
  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.searchTerm?.trim()) {
        this.isSearching = true;
        this.page = 1;
        this.cargarPlanesVenta(false); // No mostrar loading general para mantener el foco
      } else {
        this.isSearching = false;
        if (!this.selectedVendedor && !this.selectedEstado) {
          this.page = 1;
          this.cargarPlanesVenta(false);
        }
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
   * Aplica los filtros (para selectores, sin debounce)
   */
  aplicarFiltros(): void {
    this.page = 1;
    this.cargarPlanesVenta();
  }

  /**
   * Carga la lista de vendedores para el filtro
   */
  cargarVendedores(): void {
    this.isLoadingVendedores = true;
    this.vendedorHttpService.obtenerVendedores({ 
      page: 1, 
      size: 100,
      estado: 'Activo'
    }).subscribe({
      next: (response) => {
        this.vendedores = response.items;
        this.isLoadingVendedores = false;
      },
      error: (error) => {
        console.error('Error al cargar vendedores:', error);
        this.isLoadingVendedores = false;
      }
    });
  }

  /**
   * Carga los planes de venta con filtros y paginación
   */
  cargarPlanesVenta(mostrarLoading: boolean = true): void {
    if (mostrarLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.planVentaHttpService.obtenerPlanesVenta({
      page: this.page,
      size: this.size,
      nombre_plan: this.searchTerm || undefined,
      vendedor_id: this.selectedVendedor || undefined,
      estado: this.selectedEstado || undefined
    }).subscribe({
      next: (response) => {
        this.planesVenta = response.items;
        this.total = response.total;
        this.pages = response.pages;
        this.isLoading = false;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error al cargar planes de venta:', error);
        this.errorMessage = 'Error al cargar los planes de venta';
        this.isLoading = false;
        this.isSearching = false;
        this.snackBar.open('Error al cargar los planes de venta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Maneja el cambio de página del paginador
   */
  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.cargarPlanesVenta();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedVendedor = '';
    this.selectedEstado = '';
    this.page = 1;
    this.cargarPlanesVenta();
  }

  /**
   * Obtiene los nombres de vendedores para mostrar en la tabla
   */
  getVendedoresNombres(plan: PlanVenta): string {
    if (!plan.vendedores || plan.vendedores.length === 0) {
      return '-';
    }
    return plan.vendedores.map(v => `${v.nombre} ${v.apellidos}`).join(', ');
  }

  /**
   * Genera un ID de plan formateado para mostrar
   */
  getIdPlanFormateado(plan: PlanVenta, index: number): string {
    return `PV-${String((this.page - 1) * this.size + index + 1).padStart(3, '0')}`;
  }

  /**
   * Formatea el monto de ingresos
   */
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  }

  /**
   * Retorna la clase CSS para el chip de estado
   */
  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  /**
   * Verifica si hay filtros activos
   */
  get hasFiltrosActivos(): boolean {
    return !!(this.searchTerm || this.selectedVendedor || this.selectedEstado);
  }

  /**
   * Verifica si hay planes de venta
   */
  get tienePlanesVenta(): boolean {
    return this.planesVenta.length > 0;
  }

  /**
   * Abre el modal para agregar un nuevo plan de venta
   */
  openAgregarPlanDialog(): void {
    const dialogRef = this.dialog.open(AgregarPlanComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Plan de venta registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarPlanesVenta(); // Recargar lista
      }
    });
  }

  /**
   * Editar un plan de venta
   */
  editarPlan(plan: PlanVenta): void {
    console.log('Editar plan:', plan);
    this.snackBar.open('Funcionalidad de edición próximamente', 'Cerrar', { duration: 2000 });
  }

  /**
   * Ver detalle de un plan
   */
  verDetalle(plan: PlanVenta): void {
    console.log('Ver detalle:', plan);
    this.snackBar.open('Funcionalidad de detalle próximamente', 'Cerrar', { duration: 2000 });
  }
}
