import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { CargaMasivaResponseOk, DetalleError, DetalleExitoso } from '../../../../core/models/producto.models';

interface CargaHistorial {
  documento: string;
  fechaCargue: string;
  totalFilas: number;
  productsProcesados: number;
  errores: number;
  estado: 'Procesando' | 'Completado' | 'Fallido' | 'Parcial';
  detallesExitosos?: DetalleExitoso[];
  detallesErrores?: DetalleError[];
}

@Component({
  selector: 'app-carga-masiva-productos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './carga-masiva-productos.component.html',
  styleUrl: './carga-masiva-productos.component.scss'
})
export class CargaMasivaProductosComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  historialCargas: CargaHistorial[] = [];
  displayedColumns: string[] = ['documento', 'fechaCargue', 'totalFilas', 'productsProcesados', 'errores', 'estado', 'acciones'];
  
  // Nuevas propiedades para mostrar detalles
  mostrarDetalles = false;
  cargaSeleccionada: CargaHistorial | null = null;
  displayedColumnsErrores: string[] = ['fila', 'sku', 'codigo', 'error'];

  constructor(
    private readonly dialogRef: MatDialogRef<CargaMasivaProductosComponent>,
    private readonly productoService: ProductoHttpService,
    private readonly snackBar: MatSnackBar
  ) {
    this.cargarHistorial();
  }

  /**
   * Descarga la plantilla CSV de ejemplo
   */
  descargarPlantilla(): void {
    const csvContent = 'Nombre,SKU,Categoria,Precio,Fecha Vencimiento,Condiciones Almacenamiento,Bodega,Lote\n' +
      'Ejemplo Producto,SKU-001,Medicamentos,15000,31/12/2025,Almacenar en un lugar fresco y seco,Bodega Central,LOTE-001\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_carga_productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Maneja el evento de selección de archivo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  /**
   * Permite hacer clic en el área de drag & drop
   */
  onFileAreaClick(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  /**
   * Maneja el evento de drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Maneja el evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  /**
   * Elimina el archivo seleccionado
   */
  removeFile(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Inicia el proceso de carga masiva
   */
  iniciarProceso(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.mostrarDetalles = false;
    this.cargaSeleccionada = null;

    this.productoService.cargarProductosMasivo(this.selectedFile).subscribe({
      next: (response: CargaMasivaResponseOk) => {
        console.log('Carga masiva exitosa:', response);
        
        const envio = response.data.envio;
        const resumen = envio.resumen;
        
        // Determinar el estado basado en el resumen
        let estado: 'Completado' | 'Parcial' = 'Completado';
        if (resumen.fallidos > 0 && resumen.exitosos > 0) {
          estado = 'Parcial';
        }
        
        // Agregar al historial
        const nuevaCarga: CargaHistorial = {
          documento: this.selectedFile!.name,
          fechaCargue: new Date().toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          totalFilas: resumen.total_filas,
          productsProcesados: resumen.exitosos,
          errores: resumen.fallidos,
          estado: estado,
          detallesExitosos: envio.detalles_exitosos,
          detallesErrores: envio.detalles_errores
        };
        
        this.historialCargas.unshift(nuevaCarga);
        this.guardarHistorial();
        
        // Mostrar mensaje de éxito
        if (estado === 'Completado') {
          this.snackBar.open(
            `✓ Carga completada: ${resumen.exitosos} productos procesados exitosamente`,
            'Cerrar',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
        } else {
          this.snackBar.open(
            `⚠ Carga parcial: ${resumen.exitosos} exitosos, ${resumen.fallidos} con errores`,
            'Ver detalles',
            { duration: 7000, panelClass: ['warning-snackbar'] }
          ).onAction().subscribe(() => {
            this.verDetallesErrores(nuevaCarga);
          });
        }
        
        this.isUploading = false;
        this.uploadProgress = 100;
        this.selectedFile = null;
        
        // Notificar al componente padre para recargar el listado
        this.dialogRef.close({ reload: true });
      },
      error: (error: any) => {
        console.error('Error en carga masiva:', error);
        
        let totalFilas = 0;
        let exitosos = 0;
        let fallidos = 0;
        let detallesErrores: DetalleError[] = [];
        let detallesExitosos: DetalleExitoso[] = [];
        
        // Intentar extraer información del error
        if (error.error?.detail) {
          const detail = error.error.detail;
          if (detail.resumen) {
            totalFilas = detail.resumen.total_filas || 0;
            exitosos = detail.resumen.exitosos || 0;
            fallidos = detail.resumen.fallidos || 0;
          }
          // Extraer detalles de errores y exitosos
          detallesErrores = detail.detalles_errores || [];
          detallesExitosos = detail.detalles_exitosos || [];
        }
        
        // Si no hay información en el resumen, usar valores por defecto
        if (totalFilas === 0 && exitosos === 0 && fallidos === 0) {
          totalFilas = 1;
          fallidos = 1;
        }
        
        // Agregar al historial con error
        const nuevaCarga: CargaHistorial = {
          documento: this.selectedFile!.name,
          fechaCargue: new Date().toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          totalFilas: totalFilas,
          productsProcesados: exitosos,
          errores: fallidos,
          estado: 'Fallido',
          detallesExitosos: detallesExitosos,
          detallesErrores: detallesErrores
        };
        
        this.historialCargas.unshift(nuevaCarga);
        this.guardarHistorial();
        
        // Mostrar mensaje de error
        this.snackBar.open(
          `✗ Error en la carga: ${fallidos} filas fallidas`,
          'Ver detalles',
          { duration: 7000, panelClass: ['error-snackbar'] }
        ).onAction().subscribe(() => {
          this.verDetallesErrores(nuevaCarga);
        });
        
        this.isUploading = false;
        this.selectedFile = null;
      }
    });
  }

  /**
   * Cancela y cierra el diálogo
   */
  cancelar(): void {
    this.dialogRef.close();
  }

  /**
   * Carga el historial desde localStorage
   */
  private cargarHistorial(): void {
    const historialGuardado = localStorage.getItem('historialCargasProductos');
    if (historialGuardado) {
      try {
        this.historialCargas = JSON.parse(historialGuardado);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        this.historialCargas = [];
      }
    }
  }

  /**
   * Guarda el historial en localStorage
   */
  private guardarHistorial(): void {
    localStorage.setItem('historialCargasProductos', JSON.stringify(this.historialCargas));
  }

  /**
   * Descarga un archivo del historial
   */
  descargarArchivo(carga: CargaHistorial): void {
    console.log('Descargar archivo:', carga.documento);
    // Implementar descarga si es necesario
  }

  /**
   * Elimina un registro del historial
   */
  eliminarRegistro(carga: CargaHistorial): void {
    const index = this.historialCargas.indexOf(carga);
    if (index > -1) {
      this.historialCargas.splice(index, 1);
      this.guardarHistorial();
    }
  }

  /**
   * Ver más acciones para un registro
   */
  verMasAcciones(carga: CargaHistorial): void {
    console.log('Más acciones para:', carga.documento);
    // Implementar menú de acciones adicionales
  }

  /**
   * Muestra los detalles de errores de una carga
   */
  verDetallesErrores(carga: CargaHistorial): void {
    if (carga.detallesErrores && carga.detallesErrores.length > 0) {
      this.cargaSeleccionada = carga;
      this.mostrarDetalles = true;
    }
  }

  /**
   * Vuelve a la vista de historial
   */
  volverAlHistorial(): void {
    this.mostrarDetalles = false;
    this.cargaSeleccionada = null;
  }

  /**
   * Exporta los errores a un archivo CSV
   */
  exportarErrores(): void {
    if (!this.cargaSeleccionada?.detallesErrores) {
      return;
    }

    let csv = 'Fila,SKU,Código Error,Descripción\n';
    
    for (const error of this.cargaSeleccionada.detallesErrores) {
      csv += `${error.fila},"${error.sku}","${error.codigo}","${error.error}"\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `errores_${this.cargaSeleccionada.documento}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Determina si una fila tiene errores y se puede hacer click para ver detalles
   */
  tieneErrores(carga: CargaHistorial): boolean {
    return (carga.detallesErrores?.length || 0) > 0;
  }
}

