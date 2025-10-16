import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendedoresComponent } from './vendedores.component';
import { MatDialog } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('VendedoresComponent', () => {
  let component: VendedoresComponent;
  let fixture: ComponentFixture<VendedoresComponent>;

  beforeEach(async () => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [VendedoresComponent],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        provideAnimations(),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have openRegistrarVendedorDialog method', () => {
    expect(component.openRegistrarVendedorDialog).toBeDefined();
  });
});
