import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';

interface Documento {
  nombre: string;
  archivo: File;
}

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './registrar-producto.component.html',
  styleUrl: './registrar-producto.component.scss'
})
export class RegistrarProductoComponent implements OnInit {
  productoForm!: FormGroup;
  documentosAdjuntos: Documento[] = [];
  isLoading = false;
  errorMessage = '';
  
  categorias = [
    { value: 'medicamento', label: 'Medicamento' },
    { value: 'insumo', label: 'Insumo' },
    { value: 'reactivo', label: 'Reactivo' },
    { value: 'dispositivo', label: 'Dispositivo' }
  ];

  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  bodegas = [
    { value: 'bodega_principal', label: 'Bodega Principal' },
    { value: 'bodega_secundaria', label: 'Bodega Secundaria' },
    { value: 'bodega_refrigerada', label: 'Bodega Refrigerada' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RegistrarProductoComponent>,
    private readonly productoHttpService: ProductoHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombreProducto: ['', [Validators.required, Validators.minLength(3)]],
      codigoSku: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      precioUnitario: ['', [Validators.required, Validators.min(0.01)]],
      condicionesAlmacenamiento: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      bodega: ['', Validators.required],
      lote: ['', Validators.required],
      estado: ['', Validators.required]
    });
  }

  /**
   * Limpia un campo específico del formulario
   * H-3: Control y libertad para el usuario
   */
  clearField(fieldName: string): void {
    this.productoForm.patchValue({ [fieldName]: '' });
  }

  /**
   * Obtiene el mensaje de error para un campo
   * H-5: Prevención de errores
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minLength')) {
      return `Mínimo ${field.errors?.['minLength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    
    return '';
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.documentosAdjuntos.push({
          nombre: file.name,
          archivo: file
        });
      });
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      input.value = '';
    }
  }

  /**
   * Abre el selector de archivos
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Elimina un documento de la lista
   * H-3: Control y libertad para el usuario
   */
  eliminarDocumento(index: number): void {
    this.documentosAdjuntos.splice(index, 1);
  }

  /**
   * Visualiza un documento
   */
  verDocumento(documento: Documento): void {
    // Crear una URL temporal para el archivo
    const url = URL.createObjectURL(documento.archivo);
    window.open(url, '_blank');
  }

  /**
   * Guarda el producto
   * H-1: Visibilidad del estado del sistema
   */
  onSubmit(): void {
    if (this.productoForm.valid && this.documentosAdjuntos.length > 0) {
      this.isLoading = true;
      this.errorMessage = '';

      // Extraer solo los archivos del array de documentos
      const certificaciones = this.documentosAdjuntos.map(doc => doc.archivo);

      // Mapear los datos del formulario a la estructura del API
      const request = this.productoHttpService.mapearFormularioARequest(
        this.productoForm.value,
        certificaciones
      );

      // Validar datos antes de enviar
      const validacion = this.productoHttpService.validarDatosProducto(request);
      if (!validacion.valid) {
        this.isLoading = false;
        this.errorMessage = validacion.errors.join(', ');
        this.snackBar.open(this.errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Enviar al backend
      this.productoHttpService.registrarProducto(request).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Mensaje de éxito del backend (respuesta 201)
          const mensaje = response.mensaje || 'Producto registrado exitosamente';
          
          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          this.dialogRef.close(response.producto || response);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Manejo específico de errores del backend
          let mensajeError = 'Error al registrar el producto';
          
          if (error.status === 409) {
            // SKU duplicado u otro conflicto
            mensajeError = error.error?.error || error.error?.message || 'Ya existe un producto con este código SKU';
          } else if (error.status === 400) {
            // Datos inválidos
            mensajeError = error.error?.error || error.error?.message || 'Los datos proporcionados no son válidos';
          } else if (error.error?.error) {
            mensajeError = error.error.error;
          } else if (error.error?.message) {
            mensajeError = error.error.message;
          }
          
          this.errorMessage = mensajeError;
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 6000,
            panelClass: ['error-snackbar']
          });
          
          console.error('Error al registrar producto:', error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.productoForm.controls).forEach(key => {
        this.productoForm.get(key)?.markAsTouched();
      });
      
      if (this.documentosAdjuntos.length === 0) {
        this.snackBar.open('Debe adjuntar al menos una certificación', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Cierra el modal sin guardar
   * H-3: Control y libertad para el usuario
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
