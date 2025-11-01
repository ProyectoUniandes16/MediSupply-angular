import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { ProductoDetalle, Certificacion } from '../../../../core/models/producto.models';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.scss'
})
export class DetalleProductoComponent implements OnInit {
  producto: ProductoDetalle | null = null;
  isLoading = true;
  errorMessage = '';
  displayedColumns: string[] = ['tipo_certificacion', 'nombre_archivo', 'fecha_emision', 'fecha_vencimiento', 'estado', 'acciones'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { productoId: number },
    private readonly dialogRef: MatDialogRef<DetalleProductoComponent>,
    private readonly productoService: ProductoHttpService
  ) {}

  ngOnInit(): void {
    this.cargarDetalleProducto();
  }

  /**
   * Carga el detalle del producto desde el backend
   */
  cargarDetalleProducto(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productoService.obtenerProductoPorId(this.data.productoId)
      .subscribe({
        next: (producto) => {
          this.producto = producto;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalle del producto:', error);
          this.errorMessage = 'Error al cargar el detalle del producto. Por favor, intente nuevamente.';
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
      day: '2-digit'
    });
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

  /**
   * Formatea el tamaño del archivo en KB o MB
   */
  formatearTamanoArchivo(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  /**
   * Descarga una certificación
   */
  descargarCertificacion(certificacion: Certificacion): void {
    window.open(certificacion.url_descarga, '_blank');
  }
}
