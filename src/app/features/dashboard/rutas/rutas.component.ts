import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RegistrarRutaComponent } from './registrar-ruta/registrar-ruta.component';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.scss'
})
export class RutasComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly dialog: MatDialog
  ) {}

  openRegistrarRutaDialog(): void {
    const dialogRef = this.dialog.open(RegistrarRutaComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar rutas cuando se complete
        console.log('Ruta registrada:', result);
      }
    });
  }
}
