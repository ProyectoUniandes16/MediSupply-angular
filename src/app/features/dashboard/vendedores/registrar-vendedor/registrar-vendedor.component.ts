import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';

@Component({
  selector: 'app-registrar-vendedor',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './registrar-vendedor.component.html',
  styleUrl: './registrar-vendedor.component.scss'
})
export class RegistrarVendedorComponent implements OnInit {
  vendedorForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  zonas = [
    { value: 'Colombia', label: 'Colombia' },
    { value: 'México', label: 'México' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Perú', label: 'Perú' }
  ];

  estados = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RegistrarVendedorComponent>,
    private readonly vendedorHttpService: VendedorHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.vendedorForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      zona: ['', Validators.required],
      estado: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-() ]+$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Limpia un campo específico del formulario
   * H-3: Control y libertad para el usuario
   */
  clearField(fieldName: string): void {
    this.vendedorForm.patchValue({ [fieldName]: '' });
  }

  /**
   * Obtiene el mensaje de error para un campo
   * H-5: Prevención de errores
   */
  getErrorMessage(fieldName: string): string {
    const field = this.vendedorForm.get(fieldName);
    
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
   * Guarda el vendedor
   * H-1: Visibilidad del estado del sistema
   */
  onSubmit(): void {
    if (this.vendedorForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Mapear los datos del formulario a la estructura del API
      const request = this.vendedorHttpService.mapearFormularioARequest(
        this.vendedorForm.value
      );

      // Validar datos antes de enviar
      const validacion = this.vendedorHttpService.validarDatosVendedor(request);
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
      this.vendedorHttpService.registrarVendedor(request).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Mensaje de éxito del backend (respuesta 201)
          const mensaje = response.mensaje || 'Vendedor registrado exitosamente';
          
          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          this.dialogRef.close(response.vendedor || response);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Manejo específico de errores del backend
          let mensajeError = 'Error al registrar el vendedor';
          
          if (error.status === 409) {
            // Email duplicado u otro conflicto
            mensajeError = error.error?.error || error.error?.message || 'Ya existe un vendedor con este email';
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
          
          console.error('Error al registrar vendedor:', error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.vendedorForm.controls).forEach(key => {
        this.vendedorForm.get(key)?.markAsTouched();
      });
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
