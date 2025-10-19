import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

interface NavigationItem {
  icon: string;
  label: string;
  translationKey: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isMobile = false;
  isCollapsed = false;
  currentRoute = '';
  currentLanguage = 'es';

  navigationItems: NavigationItem[] = [
    { icon: 'business', label: 'Proveedores', translationKey: 'DASHBOARD.MENU.PROVEEDORES', route: '/dashboard/proveedores' },
    { icon: 'people', label: 'Vendedores', translationKey: 'DASHBOARD.MENU.VENDEDORES', route: '/dashboard/vendedores' },
    { icon: 'inventory_2', label: 'Productos', translationKey: 'DASHBOARD.MENU.PRODUCTOS', route: '/dashboard/productos' }
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Detectar cambios en el tamaño de pantalla
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Detectar cambios de ruta para actualizar el título
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
    });

    this.updateCurrentRoute();

    // Obtener el idioma actual
    this.currentLanguage = this.translate.currentLang || localStorage.getItem('language') || 'es';
  }

  /**
   * Actualiza la ruta actual para mostrar en el breadcrumb
   */
  updateCurrentRoute(): void {
    const currentUrl = this.router.url;
    const navItem = this.navigationItems.find(item => currentUrl.includes(item.route));
    this.currentRoute = navItem ? this.translate.instant(navItem.translationKey) : this.translate.instant('DASHBOARD.TITLE');
  }

  /**
   * Verifica si una ruta está activa
   * H-7: Flexibilidad y eficiencia de uso - Resaltar item activo
   */
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }

  /**
   * Alterna el estado del sidenav (expandido/colapsado)
   */
  toggleSidenav(): void {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.isCollapsed = !this.isCollapsed;
      // Forzar actualización del layout después del cambio de ancho
      setTimeout(() => {
        (this.sidenav as any)._container?._updateContentMargins();
      }, 0);
    }
  }

  /**
   * Navega a una ruta y cierra el sidenav en móviles
   */
  navigate(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  /**
   * Cambia el idioma de la aplicación
   */
  changeLanguage(language: string): void {
    this.currentLanguage = language;
    this.translate.use(language);
    localStorage.setItem('language', language);
    // Actualizar el breadcrumb con el nuevo idioma
    this.updateCurrentRoute();
  }

  /**
   * Cierra la sesión del usuario
   * H-3: Control y libertad para el usuario - Permitir salir fácilmente
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
