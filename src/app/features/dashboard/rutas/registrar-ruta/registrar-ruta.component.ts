import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { Zona, Bodega, Camion } from '../../../../core/models/ruta.models';
import { VerRutaModalComponent } from '../ver-ruta-modal/ver-ruta-modal.component';

@Component({
  selector: 'app-registrar-ruta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './registrar-ruta.component.html',
  styleUrl: './registrar-ruta.component.scss'
})
export class RegistrarRutaComponent implements OnInit {
  // Listas de datos
  zonas: Zona[] = [];
  bodegas: Bodega[] = [];
  camiones: Camion[] = [];
  pedidos: any[] = [];
  isLoadingPedidos = false;
  
  estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  // Valores seleccionados
  nombreRuta = '';
  selectedZonaId = '';
  selectedBodegaId = '';
  selectedCamionId = '';
  pedidosIds: string[] = []; // IDs de pedidos seleccionados (patrón multi-select)
  selectedEstado = '';

  // Columnas de tabla
  displayedColumnsPedidos: string[] = ['pedido', 'acciones'];

  // Estados de carga
  isLoadingZonas = false;
  isLoadingDetalle = false;
  errorMessage = '';

  // Estado de ruta calculada
  rutaCalculada = false;
  ultimaBodega: [number, number] | null = null;
  ultimosDestinos: [number, number][] = [];
  ultimaRespuestaCalculo: any = null; // Almacena la respuesta del cálculo de ruta

  constructor(
    private readonly dialogRef: MatDialogRef<RegistrarRutaComponent>,
    private readonly rutaHttpService: RutaHttpService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarZonas();
  }

  cargarZonas(): void {
    this.isLoadingZonas = true;
    this.errorMessage = '';

    this.rutaHttpService.obtenerZonas().subscribe({
      next: (response) => {
        this.zonas = response.data || [];
        this.isLoadingZonas = false;
      },
      error: (error) => {
        console.error('Error al cargar zonas:', error);
        this.errorMessage = 'Error al cargar las zonas';
        this.isLoadingZonas = false;
      }
    });
  }

  onZonaChange(): void {
    // Limpiar selecciones previas
    this.selectedBodegaId = '';
    this.selectedCamionId = '';
    this.bodegas = [];
    this.camiones = [];

    if (this.selectedZonaId) {
      this.cargarDetalleZona(this.selectedZonaId);

      // Buscar el nombre de la zona seleccionada para consultar pedidos
      const zonaObj = this.zonas.find(z => z.id === this.selectedZonaId);
      const zonaNombre = zonaObj ? zonaObj.nombre : '';
      if (zonaNombre) {
        this.cargarPedidosPorZona(zonaNombre);
      } else {
        this.pedidos = [];
      }
    } else {
      this.pedidos = [];
    }
  }

  cargarDetalleZona(zonaId: string): void {
    this.isLoadingDetalle = true;
    this.errorMessage = '';

    this.rutaHttpService.obtenerDetalleZona(zonaId).subscribe({
      next: (detalle) => {
        this.bodegas = detalle.bodegas || [];
        this.isLoadingDetalle = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle de zona:', error);
        this.errorMessage = 'Error al cargar el detalle de la zona';
        this.isLoadingDetalle = false;
      }
    });
  }

  onBodegaChange(): void {
    // Limpiar selección de camión
    this.selectedCamionId = '';
    this.camiones = [];

    if (this.selectedBodegaId) {
      const bodegaSeleccionada = this.bodegas.find(b => b.id === this.selectedBodegaId);
      if (bodegaSeleccionada) {
        this.camiones = bodegaSeleccionada.camiones || [];
      }
    }
  }

  clearZona(): void {
    this.selectedZonaId = '';
    this.selectedBodegaId = '';
    this.selectedCamionId = '';
    this.bodegas = [];
    this.camiones = [];
  }

  clearBodega(): void {
    this.selectedBodegaId = '';
    this.selectedCamionId = '';
    this.camiones = [];
  }

  clearCamion(): void {
    this.selectedCamionId = '';
  }

  getCamionSeleccionado(): Camion | undefined {
    return this.camiones.find(c => c.id === this.selectedCamionId);
  }

  /**
   * Carga los pedidos correspondientes a una zona (por nombre) con estado pendiente
   */
  cargarPedidosPorZona(zonaNombre: string): void {
    this.isLoadingPedidos = true;
    this.rutaHttpService.obtenerPedidosPorZona(zonaNombre).subscribe({
      next: (resp) => {
        this.pedidos = resp.data || [];
        this.isLoadingPedidos = false;
        
        // Mostrar alerta si no hay pedidos pendientes en la zona
        if (this.pedidos.length === 0) {
          this.snackBar.open(
            `No se encontraron pedidos pendientes en la zona "${zonaNombre}"`,
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['warning-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
        }
      },
      error: (err) => {
        console.error('Error al cargar pedidos por zona:', err);
        this.pedidos = [];
        this.isLoadingPedidos = false;
        
        // Mostrar alerta de error
        this.snackBar.open(
          'Error al cargar los pedidos pendientes de la zona',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  /**
   * Getter para obtener los pedidos seleccionados basado en los IDs
   * Sigue el patrón de vendedoresSeleccionados en agregar-plan
   */
  get pedidosSeleccionados(): any[] {
    return this.pedidos.filter(p => this.pedidosIds.includes(p.id));
  }

  /**
   * Elimina un pedido de la selección
   * Sigue el patrón de eliminarVendedor en agregar-plan
   */
  eliminarPedido(pedido: any): void {
    this.pedidosIds = this.pedidosIds.filter(id => id !== pedido.id);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Calcula la ruta óptima entre la bodega y los pedidos seleccionados
   */
  onCalcular(): void {
    // Validar que haya pedidos seleccionados
    if (this.pedidosSeleccionados.length === 0) {
      this.snackBar.open(
        'Debe seleccionar al menos un pedido para calcular la ruta',
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['warning-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      return;
    }

    // Obtener la bodega seleccionada
    const bodegaSeleccionada = this.bodegas.find(b => b.id === this.selectedBodegaId);
    if (!bodegaSeleccionada) {
      this.snackBar.open('No se encontró la bodega seleccionada', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Obtener coordenadas de la bodega (desde ubicacion string o propiedades separadas)
    let bodegaLongitud: number;
    let bodegaLatitud: number;

    if (bodegaSeleccionada.longitud && bodegaSeleccionada.latitud) {
      // Usar propiedades separadas si están disponibles
      bodegaLongitud = bodegaSeleccionada.longitud;
      bodegaLatitud = bodegaSeleccionada.latitud;
    } else if (bodegaSeleccionada.ubicacion) {
      // Parsear desde ubicacion string "latitud,longitud"
      const coords = bodegaSeleccionada.ubicacion.split(',').map(c => Number.parseFloat(c.trim()));
      if (coords.length === 2 && !Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
        bodegaLatitud = coords[0];
        bodegaLongitud = coords[1];
      } else {
        this.snackBar.open(
          'La bodega seleccionada tiene un formato de ubicación inválido',
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
        return;
      }
    } else {
      this.snackBar.open(
        'La bodega seleccionada no tiene ubicación configurada',
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      return;
    }

    // Construir array de destinos desde los pedidos seleccionados
    const destinos: [number, number][] = [];
    const pedidosSinUbicacion: any[] = [];

    for (const pedido of this.pedidosSeleccionados) {
      let pedidoLongitud: number | undefined;
      let pedidoLatitud: number | undefined;

      // Intentar obtener coordenadas de propiedades separadas
      if (pedido.longitud && pedido.latitud) {
        pedidoLongitud = pedido.longitud;
        pedidoLatitud = pedido.latitud;
      }
      // Intentar parsear desde cliente_ubicacion "latitud,longitud"
      else if (pedido.cliente_ubicacion) {
        const coords = pedido.cliente_ubicacion.split(',').map((c: string) => Number.parseFloat(c.trim()));
        if (coords.length === 2 && !Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
          pedidoLatitud = coords[0];
          pedidoLongitud = coords[1];
        }
      }

      // Si se obtuvieron coordenadas válidas, agregar al array de destinos
      if (pedidoLongitud !== undefined && pedidoLatitud !== undefined) {
        destinos.push([pedidoLongitud, pedidoLatitud]);
      } else {
        pedidosSinUbicacion.push(pedido);
      }
    }

    // Validar que todos los pedidos tengan ubicación
    if (pedidosSinUbicacion.length > 0) {
      const pedidosStr = pedidosSinUbicacion.map(p => p.nombre || p.codigo || p.id).join(', ');
      this.snackBar.open(
        `Los siguientes pedidos no tienen ubicación configurada: ${pedidosStr}`,
        'Cerrar',
        {
          duration: 6000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      return;
    }

    // Construir ubicación de la bodega [longitud, latitud]
    const bodegaUbicacion: [number, number] = [
      bodegaLongitud,
      bodegaLatitud
    ];

    // Llamar al servicio de ruta óptima
    this.isLoadingDetalle = true;
    this.rutaHttpService.calcularRutaOptima(bodegaUbicacion, destinos).subscribe({
      next: (response) => {
        this.isLoadingDetalle = false;
        console.log('Ruta óptima calculada:', response);
        
        // Guardar los datos para poder ver y registrar la ruta después
        this.rutaCalculada = true;
        this.ultimaBodega = bodegaUbicacion;
        this.ultimosDestinos = destinos;
        this.ultimaRespuestaCalculo = response;
        
        this.snackBar.open(
          'Ruta calculada exitosamente. Puede visualizarla o registrarla.',
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      },
      error: (error) => {
        this.isLoadingDetalle = false;
        this.rutaCalculada = false;
        this.ultimaRespuestaCalculo = null;
        console.error('Error al calcular ruta óptima:', error);
        
        const mensaje = error.error?.message || error.error?.error || 'Error al calcular la ruta óptima';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Abre el modal para visualizar la ruta óptima en formato HTML
   */
  onVerRuta(): void {
    if (!this.rutaCalculada || !this.ultimaBodega || this.ultimosDestinos.length === 0) {
      this.snackBar.open(
        'Primero debe calcular la ruta',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    // Llamar al servicio con formato=html
    this.isLoadingDetalle = true;
    this.rutaHttpService.obtenerRutaOptimaHTML(this.ultimaBodega, this.ultimosDestinos).subscribe({
      next: (htmlContent) => {
        this.isLoadingDetalle = false;
        
        // Abrir modal con el HTML
        this.dialog.open(VerRutaModalComponent, {
          width: '90vw',
          maxWidth: '1200px',
          height: '85vh',
          data: { html: htmlContent },
          disableClose: false
        });
      },
      error: (error) => {
        this.isLoadingDetalle = false;
        console.error('Error al obtener HTML de ruta:', error);
        
        const mensaje = error.error?.message || error.error?.error || 'Error al obtener la visualización de la ruta';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Registra la ruta calculada en el sistema
   */
  onRegistrar(): void {
    // Validar que la ruta esté calculada
    if (!this.rutaCalculada || !this.ultimaRespuestaCalculo) {
      this.snackBar.open(
        'Primero debe calcular la ruta antes de registrarla',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    // Validar estado seleccionado
    if (!this.selectedEstado) {
      this.snackBar.open(
        'Debe seleccionar un estado para la ruta',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    // Construir el array de paradas desde la respuesta del cálculo
    const ruta: any[] = [];
    const ordenOptimo = this.ultimaRespuestaCalculo.orden_optimo || [];

    for (const parada of ordenOptimo) {
      // Saltar las paradas de inicio/fin (bodega)
      if (parada.job_id === 'inicio/fin') {
        continue;
      }

      // Buscar el pedido que corresponde a esta ubicación
      const ubicacionParada = parada.ubicacion; // [longitud, latitud]
      const pedido = this.pedidosSeleccionados.find((p: any) => {
        // Obtener coordenadas del pedido
        let pedidoLon: number | undefined;
        let pedidoLat: number | undefined;

        if (p.longitud && p.latitud) {
          pedidoLon = p.longitud;
          pedidoLat = p.latitud;
        } else if (p.cliente_ubicacion) {
          const coords = p.cliente_ubicacion.split(',').map((c: string) => Number.parseFloat(c.trim()));
          if (coords.length === 2 && !Number.isNaN(coords[0]) && !Number.isNaN(coords[1])) {
            pedidoLat = coords[0];
            pedidoLon = coords[1];
          }
        }

        // Comparar las coordenadas con una pequeña tolerancia para errores de precisión
        if (pedidoLon !== undefined && pedidoLat !== undefined) {
          return Math.abs(pedidoLon - ubicacionParada[0]) < 0.0001 && 
                 Math.abs(pedidoLat - ubicacionParada[1]) < 0.0001;
        }
        return false;
      });

      if (pedido) {
        ruta.push({
          ubicacion: [ubicacionParada[0], ubicacionParada[1]], // Array [longitud, latitud]
          pedido_id: pedido.id.toString()
        });
      } else {
        console.warn('No se encontró pedido para la ubicación:', ubicacionParada);
      }
    }

    // Validar que se hayan encontrado pedidos
    if (ruta.length === 0) {
      this.snackBar.open(
        'No se pudieron asociar los pedidos con las paradas de la ruta',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Construir el payload
    const request = {
      ruta,
      bodega_id: this.selectedBodegaId,
      camion_id: this.selectedCamionId,
      zona_id: this.selectedZonaId,
      estado: this.selectedEstado
    };

    console.log('Registrando ruta con payload:', request);

    // Llamar al servicio de registro
    this.isLoadingDetalle = true;
    this.rutaHttpService.registrarRuta(request).subscribe({
      next: (response) => {
        this.isLoadingDetalle = false;
        console.log('Ruta registrada exitosamente:', response);

        this.snackBar.open(
          'Ruta registrada exitosamente',
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );

        // Cerrar el modal y enviar la respuesta
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.isLoadingDetalle = false;
        console.error('Error al registrar ruta:', error);

        const mensaje = error.error?.message || error.error?.error || 'Error al registrar la ruta';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get canCalculate(): boolean {
    return !!(
      this.nombreRuta && 
      this.selectedZonaId && 
      this.selectedBodegaId && 
      this.selectedCamionId &&
      this.pedidosIds.length > 0
    );
  }
}
