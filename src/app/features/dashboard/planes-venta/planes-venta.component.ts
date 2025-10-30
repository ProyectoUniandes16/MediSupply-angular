import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AgregarPlanComponent } from './agregar-plan/agregar-plan.component';

@Component({
  selector: 'app-planes-venta',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './planes-venta.component.html',
  styleUrl: './planes-venta.component.scss'
})
export class PlanesVentaComponent {
  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  /**
   * Abre el modal para agregar un nuevo plan de venta
   */
  openAgregarPlanDialog(): void {
    const dialogRef = this.dialog.open(AgregarPlanComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Plan de venta registrado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
