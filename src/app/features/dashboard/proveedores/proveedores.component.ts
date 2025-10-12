import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistrarProveedorComponent } from './registrar-proveedor/registrar-proveedor.component';

export interface Proveedor {
  nombre: string;
  nit: string;
  contacto: string;
  email: string;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'nit', 'contacto', 'email', 'acciones'];
  proveedores: Proveedor[] = [];

  selectedEstado = '';
  searchTerm = '';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  /**
   * Abre el modal para registrar un nuevo proveedor
   * H-7: Flexibilidad y eficiencia de uso - Acción principal destacada
   */
  openRegistrarProveedorDialog(): void {
    const dialogRef = this.dialog.open(RegistrarProveedorComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aquí se agregaría el nuevo proveedor a la lista
        console.log('Nuevo proveedor:', result);
        this.proveedores = [...this.proveedores, result];
      }
    });
  }

  /**
   * Edita un proveedor existente
   */
  editarProveedor(proveedor: Proveedor): void {
    console.log('Editar proveedor:', proveedor);
    // TODO: Abrir modal de edición
  }

  /**
   * Limpia el filtro de búsqueda
   */
  limpiarBusqueda(): void {
    this.searchTerm = '';
  }
}
