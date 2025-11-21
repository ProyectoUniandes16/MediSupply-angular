import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
// Helper para evitar conflicto de tipos Assertion/Jasmine
const jexpect = (v: any) => (expect(v) as any);

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
      imports: [
        DashboardLayoutComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideAnimations(),
        provideRouter([]),
        TranslateService
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    breakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('es');
    translateService.use('es');

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Mock the _updateContentMargins method to avoid errors in tests
    Object.defineProperty(component.sidenav, '_container', {
      value: {
        _updateContentMargins: jasmine.createSpy('_updateContentMargins')
      },
      writable: true
    });
  });

  afterEach(() => {
    // Cleanup to prevent errors in afterAll
    if (component.sidenav) {
      Object.defineProperty(component.sidenav, '_container', {
        value: {
          _updateContentMargins: () => {}
        },
        writable: true
      });
    }
  });

  it('should create', () => {
  jexpect(component).toBeTruthy();
  });

  it('should have navigation items', () => {
    // Component may filter or modify navigation items
  jexpect(component.navigationItems.length).toBeGreaterThan(0);
  jexpect(component.navigationItems.some(item => item.label === 'Proveedores')).toBe(true);
  });

  it('should call logout on AuthService when logging out', () => {
    component.logout();

  jexpect(authService.logout).toHaveBeenCalled();
  jexpect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should detect mobile breakpoint', () => {
    breakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
    
    component.ngOnInit();

  jexpect(component.isMobile).toBe(true);
  });

  it('should navigate to route', () => {
    const testRoute = '/dashboard/proveedores';
    
    component.navigate(testRoute);

  jexpect(router.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should identify active route', () => {
    (router as any).url = '/dashboard/proveedores';
    
    const isActive = component.isActiveRoute('/dashboard/proveedores');

  jexpect(isActive).toBe(true);
  });

  it('should toggle sidenav on mobile', () => {
    component.isMobile = true;
    spyOn(component.sidenav, 'toggle');

    component.toggleSidenav();

  jexpect(component.sidenav.toggle).toHaveBeenCalled();
  });

  it('should toggle isCollapsed on desktop', () => {
    component.isMobile = false;
    component.isCollapsed = false;

    component.toggleSidenav();

  jexpect(component.isCollapsed).toBe(true);

    component.toggleSidenav();

  jexpect(component.isCollapsed).toBe(false);
  });

  it('should close sidenav after navigation on mobile', () => {
    component.isMobile = true;
    spyOn(component.sidenav, 'close');

    component.navigate('/dashboard/proveedores');

  jexpect(router.navigate).toHaveBeenCalledWith(['/dashboard/proveedores']);
  jexpect(component.sidenav.close).toHaveBeenCalled();
  });

  it('should not close sidenav after navigation on desktop', () => {
    component.isMobile = false;
    spyOn(component.sidenav, 'close');

    component.navigate('/dashboard/proveedores');

  jexpect(router.navigate).toHaveBeenCalledWith(['/dashboard/proveedores']);
  jexpect(component.sidenav.close).not.toHaveBeenCalled();
  });

  it('should update current route on navigation', () => {
    (router as any).url = '/dashboard/proveedores';

    component.updateCurrentRoute();

  jexpect(component.currentRoute).toBe('DASHBOARD.MENU.PROVEEDORES');
  });

  it('should set current route to Proveedores for proveedores URL', () => {
    (router as any).url = '/dashboard/proveedores';

    component.updateCurrentRoute();

  jexpect(component.currentRoute).toBe('DASHBOARD.MENU.PROVEEDORES');
  });

  it('should change language and update localStorage', () => {
    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'use');
    spyOn(localStorage, 'setItem');

    component.changeLanguage('en');

  jexpect(component.currentLanguage).toBe('en');
  jexpect(translateService.use).toHaveBeenCalledWith('en');
  jexpect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
  });

  it('should update route after language change', () => {
    spyOn(component, 'updateCurrentRoute');

    component.changeLanguage('en');

  jexpect(component.updateCurrentRoute).toHaveBeenCalled();
  });

  it('should initialize with Spanish language from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('es');

    component.ngOnInit();

  jexpect(component.currentLanguage).toBe('es');
  });

  it('should initialize with default Spanish when no language in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    component.ngOnInit();

  jexpect(component.currentLanguage).toBe('es');
  });

  it('should return false for inactive routes', () => {
    (router as any).url = '/dashboard/proveedores';
    
    const isActive = component.isActiveRoute('/dashboard/vendedores');

  jexpect(isActive).toBe(false);
  });

  it('should have correct navigation items with translation keys', () => {
    const proveedoresItem = component.navigationItems.find(item => item.route === '/dashboard/proveedores');
    
  jexpect(proveedoresItem).toBeDefined();
  jexpect(proveedoresItem?.translationKey).toBe('DASHBOARD.MENU.PROVEEDORES');
  jexpect(proveedoresItem?.icon).toBe('business');
  });

  it('should have all main navigation items', () => {
  jexpect(component.navigationItems.length).toBe(6);
    const routes = component.navigationItems.map(item => item.route);
  jexpect(routes).toContain('/dashboard/proveedores');
  jexpect(routes).toContain('/dashboard/vendedores');
  jexpect(routes).toContain('/dashboard/planes-venta');
  jexpect(routes).toContain('/dashboard/productos');
  jexpect(routes).toContain('/dashboard/pedidos');
  jexpect(routes).toContain('/dashboard/rutas');
  });

  it('should call _updateContentMargins after toggle on desktop', (done) => {
    component.isMobile = false;
    const updateSpy = (component.sidenav as any)._container._updateContentMargins;

    component.toggleSidenav();

    setTimeout(() => {
  jexpect(updateSpy).toHaveBeenCalled();
      done();
    }, 10);
  });
});
