import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RegistrarVendedorComponent } from './registrar-vendedor/registrar-vendedor.component';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './vendedores.component.html',
  styleUrl: './vendedores.component.scss'
})
export class VendedoresComponent {

  constructor(private readonly dialog: MatDialog) {}

  /**
   * Abre el modal para registrar un nuevo vendedor
   * H-7: Flexibilidad y eficiencia de uso - Acción principal destacada
   */
  openRegistrarVendedorDialog(): void {
    const dialogRef = this.dialog.open(RegistrarVendedorComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nuevo vendedor:', result);        
      }
    });
  }
}
