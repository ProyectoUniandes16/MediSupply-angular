import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { Vendedor } from '../../../../core/models/vendedor.models';

interface MesOpcion {
  valor: number;
  nombre: string;
}

/**
 * Componente de diálogo para generar informes de ventas de vendedores
 */
@Component({
  selector: 'app-generar-informe-vendedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './generar-informe-vendedor.component.html',
  styleUrls: ['./generar-informe-vendedor.component.scss']
})
export class GenerarInformeVendedorComponent implements OnInit {
  formulario!: FormGroup;
  vendedores: Vendedor[] = [];
  anios: number[] = [];
  meses: MesOpcion[] = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];
  tiposReporte = [{ valor: 'ventas', nombre: 'Ventas' }];
  
  isLoading = false;
  isGenerating = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<GenerarInformeVendedorComponent>,
    private readonly vendedorHttpService: VendedorHttpService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.generarAnios();
    this.cargarVendedores();
  }

  /**
   * Inicializa el formulario con sus controles y validaciones
   */
  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      vendedor: ['', Validators.required],
      tipo: ['ventas', Validators.required],
      anio: ['', Validators.required],
      mes: ['', Validators.required]
    });
  }

  /**
   * Genera la lista de años (últimos 5 años)
   */
  private generarAnios(): void {
    const anioActual = new Date().getFullYear();
    this.anios = [];
    for (let i = 0; i < 5; i++) {
      this.anios.push(anioActual - i);
    }
  }

  /**
   * Carga la lista de vendedores desde el servicio
   */
  private cargarVendedores(): void {
    this.isLoading = true;
    this.vendedorHttpService.obtenerVendedores({ page: 1, size: 100 }).subscribe({
      next: (response) => {
        this.vendedores = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar vendedores:', error);
        this.snackBar.open('Error al cargar la lista de vendedores', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el informe de ventas
   */
  generarInforme(): void {
    if (this.formulario.invalid) {
      this.snackBar.open('Por favor complete todos los campos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const { vendedor, mes, anio } = this.formulario.value;
    console.log('Generando informe para:', { vendedor, mes, anio });
    this.isGenerating = true;

    this.vendedorHttpService.obtenerReporteVentas(vendedor, mes, anio).subscribe({
      next: (reporte) => {
        console.log('Reporte recibido:', reporte);
        this.isGenerating = false;
        
        if (!reporte) {
          this.snackBar.open('No se recibieron datos del reporte', 'Cerrar', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          return;
        }
        
        this.dialogRef.close(reporte);
      },
      error: (error) => {
        console.error('Error al generar informe:', error);
        const errorMessage = error?.error?.message || error?.message || 'Error al generar el informe de ventas';
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isGenerating = false;
      }
    });
  }

  /**
   * Cierra el diálogo sin generar el informe
   */
  cancelar(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene el nombre completo de un vendedor
   */
  obtenerNombreVendedor(vendedor: Vendedor): string {
    return `${vendedor.nombre} ${vendedor.apellidos}`;
  }
}
