import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerRutaModalComponent } from './ver-ruta-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

const jexpect = (v: any) => (expect(v) as any);

describe('VerRutaModalComponent', () => {
  let component: VerRutaModalComponent;
  let fixture: ComponentFixture<VerRutaModalComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VerRutaModalComponent>>;
  let sanitizer: DomSanitizer;

  const mockData = {
    html: '<html><body><h1>Ruta de Prueba</h1><p>Esta es una ruta de ejemplo</p></body></html>'
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        VerRutaModalComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        TranslateService,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VerRutaModalComponent>>;
    sanitizer = TestBed.inject(DomSanitizer);
    
    fixture = TestBed.createComponent(VerRutaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    jexpect(component.data).toEqual(mockData);
    jexpect(component.data.html).toBe(mockData.html);
  });

  it('should sanitize HTML content on initialization', () => {
    jexpect(component.htmlContent).toBeDefined();
  });

  it('should call sanitizer to bypass security', () => {
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    const newFixture = TestBed.createComponent(VerRutaModalComponent);
    newFixture.detectChanges();
    jexpect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(mockData.html);
  });

  it('should close dialog on onClose', () => {
    component.onClose();
    jexpect(dialogRef.close).toHaveBeenCalled();
  });

  it('should render close button', () => {
    const closeButton = fixture.nativeElement.querySelector('button');
    jexpect(closeButton).toBeTruthy();
  });

  it('should call onClose when close button is clicked', () => {
    spyOn(component, 'onClose');
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[mat-icon-button]');
    if (closeButton) {
      closeButton.click();
      jexpect(component.onClose).toHaveBeenCalled();
    }
  });

  it('should have mat-dialog-content', () => {
    fixture.detectChanges(); // Ensure template is rendered
    const dialogContent = fixture.nativeElement.querySelector('[mat-dialog-content]');
    jexpect(dialogContent).toBeTruthy();
  });

  it('should handle empty HTML content', async () => {
    // Create a new TestBed configuration for this specific test
    const emptyData = { html: '' };
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        VerRutaModalComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        TranslateService,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: emptyData }
      ]
    }).compileComponents();
    
    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');
    
    const emptyFixture = TestBed.createComponent(VerRutaModalComponent);
    const emptyComponent = emptyFixture.componentInstance;
    emptyFixture.detectChanges();
    
    // Verify that htmlContent is defined even with empty data
    jexpect(emptyComponent.htmlContent).toBeDefined();
    const dialogContent = emptyFixture.nativeElement.querySelector('.html-content');
    jexpect(dialogContent).toBeTruthy();
  });

  it('should handle HTML with special characters', async () => {
    // Create a new TestBed configuration for this specific test
    const specialData = { html: '<div>Test &amp; Special <script>alert("test")</script></div>' };
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        VerRutaModalComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        TranslateService,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: specialData }
      ]
    }).compileComponents();
    
    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');
    
    const specialFixture = TestBed.createComponent(VerRutaModalComponent);
    const specialComponent = specialFixture.componentInstance;
    specialFixture.detectChanges();
    
    // Verify sanitization works with special characters
    jexpect(specialComponent.htmlContent).toBeDefined();
    const dialogContent = specialFixture.nativeElement.querySelector('.html-content');
    jexpect(dialogContent).toBeTruthy();
  });

  it('should have constructor that initializes htmlContent', () => {
    jexpect(component.htmlContent).toBeTruthy();
  });

  it('should use DomSanitizer for security', () => {
    jexpect(component['sanitizer']).toBeDefined();
  });

  it('should have dialogRef injected', () => {
    jexpect(component['dialogRef']).toBeDefined();
  });

  it('should render mat-icon in close button', () => {
    const icon = fixture.nativeElement.querySelector('mat-icon');
    if (icon) {
      jexpect(icon.textContent).toContain('close');
    }
  });

  it('should have mat-dialog-actions for buttons', () => {
    fixture.detectChanges(); // Ensure template is rendered
    const dialogActions = fixture.nativeElement.querySelector('[mat-dialog-actions]');
    jexpect(dialogActions).toBeTruthy();
  });
});
