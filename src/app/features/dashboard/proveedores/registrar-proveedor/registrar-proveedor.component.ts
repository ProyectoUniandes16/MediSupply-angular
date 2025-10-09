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
    MatListModule
  ],
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit {
  proveedorForm!: FormGroup;
  documentosAdjuntos: Documento[] = [];
  
  paises = [
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'pe', label: 'Perú' }
  ];

  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistrarProveedorComponent>
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
   * Guarda el proveedor
   * H-1: Visibilidad del estado del sistema
   */
  onSubmit(): void {
    if (this.proveedorForm.valid) {
      const formData = {
        ...this.proveedorForm.value,
        documentos: this.documentosAdjuntos
      };
      
      this.dialogRef.close(formData);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.proveedorForm.controls).forEach(key => {
        this.proveedorForm.get(key)?.markAsTouched();
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
