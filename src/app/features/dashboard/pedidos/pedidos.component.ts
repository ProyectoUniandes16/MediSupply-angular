import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { PedidoHttpService } from '../../../core/services/pedido-http.service';
import { Vendedor } from '../../../core/models/vendedor.models';
import { Pedido } from '../../../core/models/pedido.models';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatPaginatorModule,
    TranslateModule
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss'
})
export class PedidosComponent implements OnInit {
  // Columnas de la tabla
  displayedColumns: string[] = ['id', 'cliente', 'vendedor', 'fecha', 'estado', 'total'];

  // Datos
  vendedores: Vendedor[] = [];
  pedidos: Pedido[] = [];

  // Paginación
  page = 1;
  size = 10;
  total = 0;

  // Filtros
  selectedVendedor = '';
  clienteId: string | number | null = '';

  // Estados
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly vendedorService: VendedorHttpService,
    private readonly pedidoService: PedidoHttpService
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
    this.cargarPedidos();
  }

  private cargarVendedores(): void {
    // Traemos una primera página amplia para poblar el select
    this.vendedorService.obtenerVendedores({ page: 1, size: 100 }).subscribe({
      next: (resp) => {
        this.vendedores = resp.items || [];
      },
      error: (err) => {
        console.error('Error al cargar vendedores para filtros:', err);
      }
    });
  }

  cargarPedidos(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.page = 1;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const params: any = {
      page: this.page,
      size: this.size
    };

    if (this.selectedVendedor) {
      params.vendedor_id = this.selectedVendedor;
    }
    if (this.clienteId !== null && this.clienteId !== '') {
      params.cliente_id = this.clienteId.toString();
    }

    this.pedidoService.obtenerPedidos(params).subscribe({
      next: (resp) => {
        // El API esperado devuelve { data: [], page?, size?, total? }
        this.pedidos = (resp && (resp as any).data) || [];
        // Si la respuesta trae paginación, úsala
        if ((resp as any).page) {
          this.page = (resp as any).page;
        }
        if ((resp as any).size) {
          this.size = (resp as any).size;
        }
        if ((resp as any).total) {
          this.total = (resp as any).total;
        } else {
          this.total = this.pedidos.length;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener pedidos:', err);
        this.errorMessage = 'Error al cargar los pedidos';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarPedidos(true);
  }

  limpiarFiltros(): void {
    this.selectedVendedor = '';
    this.clienteId = '';
    this.cargarPedidos(true);
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.cargarPedidos();
  }

  get tienePedidos(): boolean {
    return this.pedidos.length > 0;
  }

  get hasFiltrosActivos(): boolean {
    return !!(this.selectedVendedor || this.clienteId);
  }
}
