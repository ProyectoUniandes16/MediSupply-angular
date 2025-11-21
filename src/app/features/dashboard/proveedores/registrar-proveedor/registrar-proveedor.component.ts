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
import { TranslateModule } from '@ngx-translate/core';
import { ProveedorHttpService } from '../../../../core/services/proveedor-http.service';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { Zona } from '../../../../core/models/ruta.models';

interface Documento {
  nombre: string;
  archivo: File;
}

@Component({
  selector: 'app-registrar-proveedor',
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
    TranslateModule
  ],
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit {
  proveedorForm!: FormGroup;
  documentosAdjuntos: Documento[] = [];
  isLoading = false;
  isLoadingZonas = false;
  errorMessage = '';
  
  zonas: Zona[] = [];

  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RegistrarProveedorComponent>,
    private readonly proveedorHttpService: ProveedorHttpService,
    private readonly rutaHttpService: RutaHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      nombreProveedor: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.pattern(/^[0-9-]+$/)]],
      pais: ['', Validators.required],
      estado: ['', Validators.required],
      direccion: ['', Validators.required],
      nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-() ]+$/)]]
    });

    this.cargarZonas();
  }

  /**
   * Carga las zonas desde el servicio de rutas
   */
  cargarZonas(): void {
    this.isLoadingZonas = true;

    this.rutaHttpService.obtenerZonas().subscribe({
      next: (response) => {
        this.zonas = response.data || [];
        this.isLoadingZonas = false;
      },
      error: (error) => {
        console.error('Error al cargar zonas:', error);
        this.isLoadingZonas = false;
        // Mantener zonas vacías si hay error
        this.zonas = [];
      }
    });
  }

  /**
   * Limpia un campo específico del formulario
   * H-3: Control y libertad para el usuario
   */
  clearField(fieldName: string): void {
    this.proveedorForm.patchValue({ [fieldName]: '' });
  }

  /**
   * Obtiene el mensaje de error para un campo
   * H-5: Prevención de errores
   */
  getErrorMessage(fieldName: string): string {
    const field = this.proveedorForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('email')) {
      return 'El correo electrónico no es válido';
    }
    if (field?.hasError('minLength')) {
      return `Mínimo ${field.errors?.['minLength'].requiredLength} caracteres`;
    }
    if (field?.hasError('pattern')) {
      return 'El formato no es válido';
    }
    
    return '';
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        this.documentosAdjuntos.push({
          nombre: file.name,
          archivo: file
        });
      }
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
   * Guarda el proveedor
   * H-1: Visibilidad del estado del sistema
   */
  onSubmit(): void {
    if (this.proveedorForm.valid && this.documentosAdjuntos.length > 0) {
      this.isLoading = true;
      this.errorMessage = '';

      // Extraer solo los archivos del array de documentos
      const certificaciones = this.documentosAdjuntos.map(doc => doc.archivo);

      // Mapear los datos del formulario a la estructura del API
      const request = this.proveedorHttpService.mapearFormularioARequest(
        this.proveedorForm.value,
        certificaciones
      );

      // Validar datos antes de enviar
      const validacion = this.proveedorHttpService.validarDatosProveedor(request);
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
      this.proveedorHttpService.registrarProveedor(request).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Mensaje de éxito del backend (respuesta 201)
          const mensaje = response.mensaje || 'Proveedor registrado exitosamente';
          
          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          this.dialogRef.close(response.proveedor || response);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Manejo específico de errores del backend
          let mensajeError = 'Error al registrar el proveedor';
          
          if (error.status === 409) {
            // NIT duplicado u otro conflicto
            mensajeError = error.error?.error || error.error?.message || 'Ya existe un proveedor con este NIT';
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
          
          console.error('Error al registrar proveedor:', error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      for (const key of Object.keys(this.proveedorForm.controls)) {
        this.proveedorForm.get(key)?.markAsTouched();
      }
      
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
