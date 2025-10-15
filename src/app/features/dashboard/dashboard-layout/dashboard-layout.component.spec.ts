import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('DashboardLayoutComponent', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { 
      events: of({}),
      url: '/dashboard/proveedores'
    });
    const breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideAnimations(),
        provideRouter([])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    breakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigation items', () => {
    // Component may filter or modify navigation items
    expect(component.navigationItems.length).toBeGreaterThan(0);
    expect(component.navigationItems.some(item => item.label === 'Proveedores')).toBe(true);
  });

  it('should call logout on AuthService when logging out', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should detect mobile breakpoint', () => {
    breakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
    
    component.ngOnInit();

    expect(component.isMobile).toBe(true);
  });

  it('should navigate to route', () => {
    const testRoute = '/dashboard/proveedores';
    
    component.navigate(testRoute);

    expect(router.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should identify active route', () => {
    (router as any).url = '/dashboard/proveedores';
    
    const isActive = component.isActiveRoute('/dashboard/proveedores');

    expect(isActive).toBe(true);
  });

  it('should toggle sidenav on mobile', () => {
    component.isMobile = true;
    spyOn(component.sidenav, 'toggle');

    component.toggleSidenav();

    expect(component.sidenav.toggle).toHaveBeenCalled();
  });

  it('should toggle isCollapsed on desktop', () => {
    component.isMobile = false;
    component.isCollapsed = false;

    component.toggleSidenav();

    expect(component.isCollapsed).toBe(true);

    component.toggleSidenav();

    expect(component.isCollapsed).toBe(false);
  });

  it('should close sidenav after navigation on mobile', () => {
    component.isMobile = true;
    spyOn(component.sidenav, 'close');

    component.navigate('/dashboard/proveedores');

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/proveedores']);
    expect(component.sidenav.close).toHaveBeenCalled();
  });

  it('should not close sidenav after navigation on desktop', () => {
    component.isMobile = false;
    spyOn(component.sidenav, 'close');

    component.navigate('/dashboard/proveedores');

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/proveedores']);
    expect(component.sidenav.close).not.toHaveBeenCalled();
  });

  it('should update current route on navigation', () => {
    (router as any).url = '/dashboard/proveedores';

    component.updateCurrentRoute();

    expect(component.currentRoute).toBe('Proveedores');
  });

  it('should set current route to Proveedores for proveedores URL', () => {
    (router as any).url = '/dashboard/proveedores';

    component.updateCurrentRoute();

    expect(component.currentRoute).toBe('Proveedores');
  });
});
