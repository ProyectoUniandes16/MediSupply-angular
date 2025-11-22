import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { CargaMasivaResponseOk, DetalleError, DetalleExitoso, ImportJobItem, ObtenerJobsResponse } from '../../../../core/models/producto.models';

type EstadoJob = 'EN_COLA' | 'PROCESANDO' | 'COMPLETADO' | 'FALLIDO' | 'PARCIAL';

interface CargaHistorial {
  jobId: string;
  documento: string;
  fechaCargue: string;
  totalFilas: number;
  productsProcesados: number;
  errores: number;
  estado: EstadoJob;
  progreso: number;
  fechaFinalizacion: string | null;
  tiempoTranscurrido: number | null;
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
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './carga-masiva-productos.component.html',
  styleUrl: './carga-masiva-productos.component.scss'
})
export class CargaMasivaProductosComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  historialCargas: CargaHistorial[] = [];
  displayedColumns: string[] = ['jobId', 'documento', 'fechaCargue', 'totalFilas', 'productsProcesados', 'errores', 'estado', 'acciones'];
  
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
    const csvContent = 'nombre,codigo_sku,categoria,precio_unitario,condiciones_almacenamiento,fecha_vencimiento,proveedor_id,usuario_registro,estado,url_certificacion,tipo_certificacion,fecha_vencimiento_cert,cantidad,ubicacion\n' +
      'Producto 2,SKU-DIS-002,dispositivo,159.89,"Temperatura ambiente (15-25C)",14/11/2028,2,tester@demo.com,Activo,https://certs.medisupply.com/dispositivo/sku-DIS-002.pdf,FDA,14/11/2028,1,bodega_refrigerada\n';
    
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
        
        // Usar el estado que viene del servidor, o determinarlo basado en el resumen
        let estado: EstadoJob = (envio.estado?.toUpperCase() as EstadoJob) || 'COMPLETADO';
        
        // Si no viene el estado del servidor, determinarlo basado en el resumen
        if (!envio.estado) {
          if (resumen.fallidos > 0 && resumen.exitosos > 0) {
            estado = 'PARCIAL';
          } else if (resumen.fallidos > 0) {
            estado = 'FALLIDO';
          }
        }
        
        // Recargar el historial desde el servidor después de la carga
        this.cargarHistorial();
        
        // Mostrar mensaje según el estado
        if (estado === 'EN_COLA') {
          this.snackBar.open(
            `⏱ Carga en cola: El archivo se procesará próximamente`,
            'Cerrar',
            { duration: 5000, panelClass: ['info-snackbar'] }
          );
        } else if (estado === 'COMPLETADO') {
          this.snackBar.open(
            `✓ Carga completada: ${resumen.exitosos} productos procesados exitosamente`,
            'Cerrar',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
        } else if (estado === 'PARCIAL') {
          this.snackBar.open(
            `⚠ Carga parcial: ${resumen.exitosos} exitosos, ${resumen.fallidos} con errores`,
            'Cerrar',
            { duration: 7000, panelClass: ['warning-snackbar'] }
          );
        } else if (estado === 'PROCESANDO') {
          this.snackBar.open(
            `⏳ Procesando: El archivo está siendo procesado`,
            'Cerrar',
            { duration: 5000, panelClass: ['info-snackbar'] }
          );
        }
        
        // Detener el spinner y limpiar el archivo seleccionado
        this.isUploading = false;
        this.uploadProgress = 100;
        this.selectedFile = null;
      },
      error: (error: any) => {
        console.error('Error en carga masiva:', error);
        
        let fallidos = 0;
        
        // Intentar extraer información del error
        if (error.error?.detail) {
          const detail = error.error.detail;
          if (detail.resumen) {
            fallidos = detail.resumen.fallidos || 1;
          }
        }
        
        // Si no hay información en el resumen, usar valor por defecto
        if (fallidos === 0) {
          fallidos = 1;
        }
        
        // Recargar el historial desde el servidor después del error
        this.cargarHistorial();
        
        // Mostrar mensaje de error
        this.snackBar.open(
          `✗ Error en la carga: ${fallidos} filas fallidas`,
          'Cerrar',
          { duration: 7000, panelClass: ['error-snackbar'] }
        );
        
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
   * Carga el historial desde el servicio GET /importar-csv/jobs
   */
  private cargarHistorial(): void {
    const params = {
      limit: 10,
      offset: 0
    };

    this.productoService.obtenerJobsImportacion(params).subscribe({
      next: (response: ObtenerJobsResponse) => {
        this.historialCargas = response.data.jobs.map((job: ImportJobItem) => this.mapearJobAHistorial(job));
      },
      error: (error: any) => {
        console.error('Error al cargar historial:', error);
        this.historialCargas = [];
      }
    });
  }

  /**
   * Mapea un ImportJobItem a CargaHistorial
   */
  private mapearJobAHistorial(job: ImportJobItem): CargaHistorial {
    // Mapear el estado del job al estado del historial
    let estado: EstadoJob = job.estado as EstadoJob;
    
    // Si está completado y tiene errores y exitosos, es parcial
    if (job.estado === 'COMPLETADO' && job.fallidos > 0 && job.exitosos > 0) {
      estado = 'PARCIAL';
    }

    return {
      jobId: job.job_id,
      documento: job.nombre_archivo,
      fechaCargue: new Date(job.fecha_creacion).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      totalFilas: job.total_filas,
      productsProcesados: job.exitosos,
      errores: job.fallidos,
      estado: estado,
      progreso: job.progreso,
      fechaFinalizacion: job.fecha_finalizacion ? new Date(job.fecha_finalizacion).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      tiempoTranscurrido: job.tiempo_transcurrido_segundos
    };
  }

  /**
   * Muestra los detalles de una carga
   * Solo se permite ver detalles si el estado es diferente a EN_COLA
   */
  verDetallesErrores(carga: CargaHistorial): void {
    if (carga.estado === 'EN_COLA') {
      return;
    }
    this.cargaSeleccionada = carga;
    this.mostrarDetalles = true;
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

}

