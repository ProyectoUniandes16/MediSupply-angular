import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { Vendedor } from '../../../../core/models/vendedor.models';

@Component({
  selector: 'app-detalle-vendedor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './detalle-vendedor.component.html',
  styleUrl: './detalle-vendedor.component.scss'
})
export class DetalleVendedorComponent implements OnInit {
  vendedor: Vendedor | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { vendedorId: string },
    private readonly dialogRef: MatDialogRef<DetalleVendedorComponent>,
    private readonly vendedorService: VendedorHttpService
  ) {}

  ngOnInit(): void {
    this.cargarDetalleVendedor();
  }

  /**
   * Carga el detalle del vendedor desde el backend
   */
  cargarDetalleVendedor(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vendedorService.obtenerVendedorPorId(this.data.vendedorId)
      .subscribe({
        next: (vendedor) => {
          this.vendedor = vendedor;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalle del vendedor:', error);
          this.errorMessage = 'Error al cargar el detalle del vendedor. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Cierra el diálogo
   */
  cerrar(): void {
    this.dialogRef.close();
  }

  /**
   * Retorna el estilo de chip según el estado
   */
  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
