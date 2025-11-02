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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { PlanVentaHttpService } from '../../../../core/services/plan-venta-http.service';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { Vendedor } from '../../../../core/models/vendedor.models';

@Component({
  selector: 'app-agregar-plan',
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
    MatTableModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './agregar-plan.component.html',
  styleUrl: './agregar-plan.component.scss'
})
export class AgregarPlanComponent implements OnInit {
  planForm!: FormGroup;
  isLoading = false;
  isLoadingVendedores = false;
  errorMessage = '';
  vendedores: Vendedor[] = [];
  displayedColumns: string[] = ['nombre', 'email', 'telefono', 'acciones'];
  
  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AgregarPlanComponent>,
    private readonly planVentaHttpService: PlanVentaHttpService,
    private readonly vendedorHttpService: VendedorHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.planForm = this.fb.group({
      nombrePlan: ['', [Validators.required, Validators.minLength(3)]],
      vendedoresIds: [[], Validators.required],
      periodo: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
      metaIngresos: ['', [Validators.required, Validators.min(1)]],
      metaVisitas: ['', [Validators.required, Validators.min(1)]],
      metaClientesNuevos: ['', [Validators.required, Validators.min(1)]],
      estado: ['', Validators.required]
    });

    this.cargarVendedores();
  }

  /**
   * Carga la lista de vendedores activos
   */
  cargarVendedores(): void {
    this.isLoadingVendedores = true;
    
    // Obtener todos los vendedores activos
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
        this.snackBar.open('Error al cargar vendedores', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Limpia un campo específico del formulario
   */
  clearField(fieldName: string): void {
    this.planForm.patchValue({ [fieldName]: '' });
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.planForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minLength')) {
      return `Mínimo ${field.errors?.['minLength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    if (field?.hasError('pattern')) {
      if (fieldName === 'periodo') {
        return 'El formato debe ser YYYY-MM (ej: 2025-01)';
      }
      return 'El formato no es válido';
    }
    
    return '';
  }

  /**
   * Obtiene el nombre completo del vendedor para mostrar en el select
   */
  getVendedorNombre(vendedor: Vendedor): string {
    return `${vendedor.nombre} ${vendedor.apellidos}`;
  }

  /**
   * Obtiene los vendedores seleccionados basado en los IDs del formulario
   */
  get vendedoresSeleccionados(): Vendedor[] {
    const ids = this.planForm.get('vendedoresIds')?.value || [];
    return this.vendedores.filter(v => ids.includes(v.id));
  }

  /**
   * Elimina un vendedor de la selección
   */
  eliminarVendedor(vendedor: Vendedor): void {
    const ids = this.planForm.get('vendedoresIds')?.value || [];
    const nuevosIds = ids.filter((id: string) => id !== vendedor.id);
    this.planForm.patchValue({ vendedoresIds: nuevosIds });
  }

  /**
   * Guarda el plan de venta
   */
  onSubmit(): void {
    if (this.planForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Mapear los datos del formulario a la estructura del API
      const request = this.planVentaHttpService.mapearFormularioARequest(
        this.planForm.value
      );

      // Validar datos antes de enviar
      const validacion = this.planVentaHttpService.validarDatosPlanVenta(request);
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
      this.planVentaHttpService.registrarPlanVenta(request).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Mensaje de éxito
          const mensaje = response.mensaje || 'Plan de venta registrado exitosamente';
          
          this.snackBar.open(mensaje, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          this.dialogRef.close(response.plan || response);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Manejo específico de errores del backend
          let mensajeError = 'Error al registrar el plan de venta';
          
          if (error.status === 409) {
            // Conflicto - plan duplicado
            mensajeError = error.error?.error || error.error?.message || 'Ya existe un plan con estos datos';
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
          
          console.error('Error al registrar plan de venta:', error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      for (const key of Object.keys(this.planForm.controls)) {
        this.planForm.get(key)?.markAsTouched();
      }
    }
  }

  /**
   * Cierra el modal sin guardar
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
