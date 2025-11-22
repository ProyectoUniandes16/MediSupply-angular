import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VisorReporteVendedorComponent } from './visor-reporte-vendedor.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReporteVentasVendedor } from '../../../../core/models/vendedor.models';

const jexpect = (v: any) => (expect(v) as any);

describe('VisorReporteVendedorComponent', () => {
  let component: VisorReporteVendedorComponent;
  let fixture: ComponentFixture<VisorReporteVendedorComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VisorReporteVendedorComponent>>;

  const mockReporte: ReporteVentasVendedor = {
    vendedor: {
      id: '1',
      nombre_completo: 'Juan Pérez',
      correo: 'juan@test.com',
      zona: 'Colombia'
    },
    periodo: {
      mes: 11,
      anio: 2025,
      mes_nombre: 'Noviembre',
      periodo_formato: '2025-11'
    },
    metricas: {
      ventas_realizadas: 10,
      monto_total: 1000000,
      monto_promedio: 100000,
      clientes_unicos: 5,
      meta_ingresos_total: 1200000,
      cumplimiento_porcentaje: 83.33
    },
    pedidos_detalle: [
      {
        id: 'P001',
        cliente: 'Cliente Prueba',
        fecha: '2025-11-15',
        productos: 5,
        monto: 500000
      }
    ],
    planes: [
      {
        id: 'PL001',
        periodo: '2025-11',
        meta_ingresos: 1200000
      }
    ]
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        VisorReporteVendedorComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockReporte }
      ]
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VisorReporteVendedorComponent>>;
    
    fixture = TestBed.createComponent(VisorReporteVendedorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    jexpect(component.data).toEqual(mockReporte);
  });

  it('should generate PDF on init', fakeAsync(() => {
    spyOn(component as any, 'generarPDF').and.callThrough();
    component.ngOnInit();
    jexpect((component as any).generarPDF).toHaveBeenCalled();
  }));

  it('should set isGenerating to false after PDF generation', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    jexpect(component.isGenerating).toBe(false);
  }));

  it('should create PDF blob', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    jexpect(component.pdfBlob).toBeDefined();
  }));

  it('should create safe PDF URL', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    jexpect(component.pdfUrl).toBeDefined();
  }));

  it('should close dialog', () => {
    component.cerrar();
    jexpect(dialogRef.close).toHaveBeenCalled();
  });

  it('should download PDF', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    component.pdfBlob = blob;

    const createElementSpy = spyOn(document, 'createElement').and.callThrough();
    const appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();

    component.descargarPDF();

    jexpect(createElementSpy).toHaveBeenCalledWith('a');
    jexpect(appendChildSpy).toHaveBeenCalled();
  });

  it('should not download PDF if blob is null', () => {
    component.pdfBlob = null;
    const createElementSpy = spyOn(document, 'createElement');

    component.descargarPDF();

    jexpect(createElementSpy).not.toHaveBeenCalled();
  });

  it('should format currency correctly', () => {
    const formatted = (component as any).formatearMoneda(1000000);
    jexpect(formatted).toContain('1.000.000');
  });

  it('should format date correctly', () => {
    const formatted = (component as any).formatearFecha('2025-11-15');
    jexpect(formatted).toBeTruthy();
  });

  it('should create document definition', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    jexpect(docDef).toBeDefined();
    jexpect(docDef.content).toBeDefined();
    jexpect(docDef.styles).toBeDefined();
  });

  it('should include vendedor info in document', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('Juan Pérez');
    jexpect(content).toContain('Colombia');
  });

  it('should include metricas in document', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('10');
    jexpect(content).toContain('83.33');
  });

  it('should include pedidos in document when available', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('Cliente Prueba');
  });

  it('should show message when no pedidos', () => {
    const reporteSinPedidos = { ...mockReporte, pedidos_detalle: [] };
    component.data = reporteSinPedidos;
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('No hay pedidos registrados');
  });

  it('should include planes in document when available', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('PL001');
  });

  it('should show message when no planes', () => {
    const reporteSinPlanes = { ...mockReporte, planes: [] };
    component.data = reporteSinPlanes;
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('No hay planes de venta asignados');
  });

  it('should have correct PDF styles', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    jexpect(docDef.styles.header).toBeDefined();
    jexpect(docDef.styles.subheader).toBeDefined();
    jexpect(docDef.styles.sectionHeader).toBeDefined();
    jexpect(docDef.styles.tableHeader).toBeDefined();
  });

  it('should have correct page margins', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    jexpect(docDef.pageMargins).toEqual([40, 60, 40, 60]);
  });

  it('should handle error during PDF generation', fakeAsync(() => {
    spyOn(console, 'error');
    spyOn((component as any), 'crearDocumentoDefinicion').and.throwError('PDF Error');
    
    (component as any).generarPDF();
    tick();

    jexpect(console.error).toHaveBeenCalled();
    jexpect(component.isGenerating).toBe(false);
  }));

  it('should format currency with zero decimals', () => {
    const formatted = (component as any).formatearMoneda(1500000);
    // Should contain $ and not have decimal separator
    jexpect(formatted).toContain('$');
    jexpect(formatted).not.toContain(',00');
  });

  it('should format fecha with correct locale', () => {
    const formatted = (component as any).formatearFecha('2025-11-22');
    jexpect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should sanitize PDF URL', fakeAsync(() => {
    const sanitizer = TestBed.inject(DomSanitizer);
    spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
    
    fixture.detectChanges();
    tick(100);

    jexpect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
  }));

  it('should create download link with correct filename', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    component.pdfBlob = blob;

    const link = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(link);
    spyOn(link, 'click');

    component.descargarPDF();

    jexpect(link.download).toContain('reporte-ventas');
    jexpect(link.download).toContain('Juan-Pérez');
    jexpect(link.download).toContain('2025-11');
  });

  it('should clean up URL after download', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    component.pdfBlob = blob;

    spyOn(URL, 'revokeObjectURL');
    component.descargarPDF();

    jexpect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should include correct table headers in document', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('Ventas Realizadas');
    jexpect(content).toContain('Monto Total');
    jexpect(content).toContain('Cumplimiento');
  });

  it('should display vendedor email in document', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('juan@test.com');
  });

  it('should display periodo format in header', () => {
    const docDef = (component as any).crearDocumentoDefinicion();
    const content = JSON.stringify(docDef.content);
    jexpect(content).toContain('2025-11');
  });
});
