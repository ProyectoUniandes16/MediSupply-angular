import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RegistrarProductoComponent } from './registrar-producto/registrar-producto.component';
import { CargaMasivaProductosComponent } from './carga-masiva-productos/carga-masiva-productos.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {

  constructor(private readonly dialog: MatDialog) {}

  /**
   * Abre el modal para registrar un nuevo producto
   * H-7: Flexibilidad y eficiencia de uso - Acción principal destacada
   */
  openRegistrarProductoDialog(): void {
    const dialogRef = this.dialog.open(RegistrarProductoComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nuevo producto:', result);
        // Aquí se agregaría el nuevo producto a la lista si tuviera tabla
      }
    });
  }

  /**
   * Abre el modal para carga masiva de productos
   */
  openCargaMasivaDialog(): void {
    const dialogRef = this.dialog.open(CargaMasivaProductosComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.reload) {
        console.log('Recargando lista de productos...');
        // Aquí se recargaría la lista de productos cuando se implemente la tabla
      }
    });
  }
}
