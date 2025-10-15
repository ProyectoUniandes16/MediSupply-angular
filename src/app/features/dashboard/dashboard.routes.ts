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
        path: 'productos',
        loadComponent: () => import('./productos/productos.component').then(m => m.ProductosComponent)
      }
    ]
  }
];
