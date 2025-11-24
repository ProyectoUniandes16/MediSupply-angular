import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { BodegaSimple } from '../../../../core/models/ruta.models';
import { InventarioDetalle, ObtenerInventariosPorUbicacionResponse } from '../../../../core/models/producto.models';
import { DetalleProductoComponent } from '../detalle-producto/detalle-producto.component';

@Component({
  selector: 'app-inventarios-por-bodega-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './inventarios-por-bodega-dialog.component.html',
  styleUrls: ['./inventarios-por-bodega-dialog.component.scss']
})
export class InventariosPorBodegaDialogComponent implements OnInit {
  bodegas: BodegaSimple[] = [];
  selectedBodega = '';
  inventarios: InventarioDetalle[] = [];
  isLoadingBodegas = false;
  isLoadingInventarios = false;
  errorMessage = '';
  displayedColumns: string[] = ['productoId', 'productoNombre', 'productoSku', 'cantidad', 'ubicacion', 'fechaActualizacion', 'acciones'];

  constructor(
    private readonly dialogRef: MatDialogRef<InventariosPorBodegaDialogComponent>,
    private readonly dialog: MatDialog,
    private readonly rutaService: RutaHttpService,
    private readonly productoService: ProductoHttpService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarBodegas();
  }

  cargarBodegas(): void {
    this.isLoadingBodegas = true;
    this.rutaService.obtenerBodegas().subscribe({
      next: (resp) => {
        this.bodegas = resp.data || [];
        this.isLoadingBodegas = false;
      },
      error: (err) => {
        console.error('Error al cargar bodegas', err);
        this.isLoadingBodegas = false;
        this.snackBar.open(this.translate.instant('PRODUCTOS.INVENTORY_BY_WAREHOUSE.ERROR_LOADING'), 'Cerrar', { duration: 4000 });
      }
    });
  }

  consultarInventarios(): void {
    if (!this.selectedBodega) {
      return;
    }
    this.inventarios = [];
    this.isLoadingInventarios = true;
    this.errorMessage = '';

    // Endpoint: GET /inventarios?ubicacion=bodegaNombre
    this.productoService.obtenerInventariosPorUbicacion(this.selectedBodega).subscribe({
      next: (resp) => {
        this.inventarios = resp.inventarios || [];
        this.isLoadingInventarios = false;
        if (this.inventarios.length === 0) {
          this.snackBar.open(this.translate.instant('PRODUCTOS.INVENTORY_BY_WAREHOUSE.EMPTY'), 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Error al consultar inventarios por bodega', err);
        this.errorMessage = this.translate.instant('PRODUCTOS.INVENTORY_BY_WAREHOUSE.ERROR_LOADING');
        this.isLoadingInventarios = false;
        this.snackBar.open(this.translate.instant('PRODUCTOS.INVENTORY_BY_WAREHOUSE.ERROR_LOADING'), 'Cerrar', { duration: 4000 });
      }
    });
  }

  limpiarFiltro(): void {
    this.selectedBodega = '';
    this.inventarios = [];
    this.errorMessage = '';
  }

  /**
   * Abre el modal de detalle del producto
   */
  verDetalleProducto(productoId: number): void {
    this.dialog.open(DetalleProductoComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        productoId: productoId
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
