import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RegistrarProveedorComponent } from './registrar-proveedor/registrar-proveedor.component';
import { ProveedorHttpService } from '../../../core/services/proveedor-http.service';
import { Proveedor, Paginacion } from '../../../core/models/proveedor.models';

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
    MatTooltipModule
  ],
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
  errorMessage = '';
  
  // Listas para filtros
  paises = [
    { value: '', label: 'Todos' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'México', label: 'México' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Perú', label: 'Perú' }
  ];
  
  estados = [
    { value: '', label: 'Todos' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
  ];

  constructor(
    private readonly dialog: MatDialog,
    private readonly proveedorService: ProveedorHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  /**
   * Carga la lista de proveedores desde el backend con filtros
   */
  cargarProveedores(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.paginacion.pagina = 1;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const params: any = {
      pagina: this.paginacion.pagina,
      por_pagina: this.paginacion.por_pagina
    };

    if (this.searchTerm) {
      params.nombre = this.searchTerm;
    }
    if (this.selectedPais) {
      params.pais = this.selectedPais;
    }
    if (this.selectedEstado) {
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
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          this.errorMessage = 'Error al cargar los proveedores. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 5000 });
        }
      });
  }

  /**
   * Aplica los filtros y recarga desde el backend
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
