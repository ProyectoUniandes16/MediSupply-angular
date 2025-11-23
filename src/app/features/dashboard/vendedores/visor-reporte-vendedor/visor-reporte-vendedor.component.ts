import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReporteVentasVendedor } from '../../../../core/models/vendedor.models';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar las fuentes de pdfMake
(pdfMake as any).vfs = pdfFonts;

/**
 * Componente para visualizar el reporte de ventas en formato PDF
 */
@Component({
  selector: 'app-visor-reporte-vendedor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './visor-reporte-vendedor.component.html',
  styleUrls: ['./visor-reporte-vendedor.component.scss']
})
export class VisorReporteVendedorComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;
  isGenerating = true;
  pdfBlob: Blob | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReporteVentasVendedor,
    private readonly dialogRef: MatDialogRef<VisorReporteVendedorComponent>,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.generarPDF();
  }

  /**
   * Genera el PDF del reporte de ventas
   */
  private generarPDF(): void {
    try {
      const docDefinition = this.crearDocumentoDefinicion();
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      pdfDocGenerator.getBlob((blob: Blob) => {
        this.pdfBlob = blob;
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isGenerating = false;
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.isGenerating = false;
    }
  }

  /**
   * Crea la definición del documento PDF
   */
  private crearDocumentoDefinicion(): any {
    const { vendedor, periodo, metricas, pedidos_detalle, planes } = this.data;

    return {
      content: [
        // Encabezado
        {
          text: 'REPORTE DE VENTAS',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: periodo.periodo_formato,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // Información del vendedor
        {
          text: 'INFORMACIÓN DEL VENDEDOR',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Nombre: ${vendedor.nombre_completo}`, margin: [0, 0, 0, 5] },
                { text: `Zona: ${vendedor.zona}`, margin: [0, 0, 0, 5] }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: `Email: ${vendedor.correo}`, margin: [0, 0, 0, 5] },
                { text: `ID: ${vendedor.id}`, margin: [0, 0, 0, 5] }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // Métricas de ventas
        {
          text: 'MÉTRICAS DE VENTAS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Ventas Realizadas', style: 'tableHeader' },
                { text: 'Monto Total', style: 'tableHeader' },
                { text: 'Monto Promedio', style: 'tableHeader' }
              ],
              [
                { text: metricas.ventas_realizadas.toString(), alignment: 'center' },
                { text: this.formatearMoneda(metricas.monto_total), alignment: 'center' },
                { text: this.formatearMoneda(metricas.monto_promedio), alignment: 'center' }
              ]
            ]
          },
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Clientes Únicos', style: 'tableHeader' },
                { text: 'Meta de Ingresos', style: 'tableHeader' },
                { text: 'Cumplimiento', style: 'tableHeader' }
              ],
              [
                { text: metricas.clientes_unicos.toString(), alignment: 'center' },
                { text: this.formatearMoneda(metricas.meta_ingresos_total), alignment: 'center' },
                { text: `${metricas.cumplimiento_porcentaje.toFixed(2)}%`, alignment: 'center' }
              ]
            ]
          },
          margin: [0, 0, 0, 20]
        },

        // Detalle de pedidos
        {
          text: 'DETALLE DE PEDIDOS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        pedidos_detalle.length > 0 ? {
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'ID Pedido', style: 'tableHeader' },
                { text: 'Cliente ID', style: 'tableHeader' },
                { text: 'Fecha Pedido', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' },
                { text: 'Productos', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...pedidos_detalle.map(pedido => [
                { text: pedido.id.toString(), fontSize: 9 },
                { text: pedido.cliente_id.toString(), fontSize: 9 },
                { text: this.formatearFecha(pedido.fecha_pedido), fontSize: 9, alignment: 'center' },
                { text: pedido.estado, fontSize: 9, alignment: 'center' },
                { text: pedido.total_productos.toString(), fontSize: 9, alignment: 'center' },
                { text: this.formatearMoneda(pedido.total), fontSize: 9, alignment: 'right' }
              ])
            ]
          },
          margin: [0, 0, 0, 20]
        } : {
          text: 'No hay pedidos registrados en este período',
          italics: true,
          color: '#666',
          margin: [0, 0, 0, 20]
        },

        // Planes de venta
        {
          text: 'PLANES DE VENTA',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        planes.length > 0 ? {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'ID Plan', style: 'tableHeader' },
                { text: 'Período', style: 'tableHeader' },
                { text: 'Meta de Ingresos', style: 'tableHeader' }
              ],
              ...planes.map(plan => [
                { text: plan.id, fontSize: 10 },
                { text: plan.periodo, fontSize: 10, alignment: 'center' },
                { text: this.formatearMoneda(plan.meta_ingresos), fontSize: 10, alignment: 'right' }
              ])
            ]
          }
        } : {
          text: 'No hay planes de venta asignados',
          italics: true,
          color: '#666'
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#1976d2'
        },
        subheader: {
          fontSize: 16,
          bold: true,
          color: '#666'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1976d2',
          decoration: 'underline'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white',
          fillColor: '#1976d2',
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: 10
      },
      pageMargins: [40, 60, 40, 60]
    };
  }

  /**
   * Formatea un número como moneda
   */
  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  /**
   * Formatea una fecha en formato legible
   */
  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Descarga el PDF
   */
  descargarPDF(): void {
    if (this.pdfBlob) {
      const url = URL.createObjectURL(this.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ventas-${this.data.vendedor.nombre_completo.replaceAll(/\s+/g, '-')}-${this.data.periodo.periodo_formato}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Cierra el diálogo
   */
  cerrar(): void {
    this.dialogRef.close();
  }
}
