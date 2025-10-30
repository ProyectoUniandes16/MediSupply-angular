import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanesVentaComponent } from './planes-venta.component';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('PlanesVentaComponent', () => {
  let component: PlanesVentaComponent;
  let fixture: ComponentFixture<PlanesVentaComponent>;
  let dialog: MatDialog;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlanesVentaComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        TranslateService
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(PlanesVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have openAgregarPlanDialog method', () => {
    expect(component.openAgregarPlanDialog).toBeDefined();
    expect(typeof component.openAgregarPlanDialog).toBe('function');
  });

  it('should verify dialog afterClosed subscription logic with result', () => {
    // Espiamos el MatDialog de la instancia del componente directamente
    const dialogOpenSpy = spyOn((component as any).dialog, 'open').and.returnValue({
      afterClosed: () => of({ id: '123', nombre_plan: 'Test Plan' })
    } as any);
    const snackBarOpenSpy = spyOn((component as any).snackBar, 'open');

    component.openAgregarPlanDialog();

    expect(dialogOpenSpy).toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Plan de venta registrado exitosamente',
      'Cerrar',
      jasmine.objectContaining({ duration: 3000 })
    );
  });

  it('should not show success message when dialog is cancelled', () => {
    spyOn((component as any).dialog, 'open').and.returnValue({
      afterClosed: () => of(null)
    } as any);
    const snackBarOpenSpy = spyOn((component as any).snackBar, 'open');

    component.openAgregarPlanDialog();

    expect(snackBarOpenSpy).not.toHaveBeenCalled();
  });

  it('should render title correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
  });

  it('should render add button correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[color="primary"]');
    expect(button).toBeTruthy();
  });

  it('should render empty state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });
});
