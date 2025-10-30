import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'proveedores',
        pathMatch: 'full'
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./proveedores/proveedores.component').then(m => m.ProveedoresComponent)
      },
      {
        path: 'vendedores',
        loadComponent: () => import('./vendedores/vendedores.component').then(m => m.VendedoresComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./productos/productos.component').then(m => m.ProductosComponent)
      },
      {
        path: 'planes-venta',
        loadComponent: () => import('./planes-venta/planes-venta.component').then(m => m.PlanesVentaComponent)
      },
    ]
  }
];
