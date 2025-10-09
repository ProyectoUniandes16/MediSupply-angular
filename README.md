# MedySupply - Aplicación Web

Aplicación web SPA (Single Page Application) desarrollada con Angular 19 y Angular Material para la gestión de proveedores, vendedores, productos y rutas de distribución médica.

## 🚀 Características

- **Arquitectura Modular**: Implementación de módulos de funcionalidad con carga perezosa (Lazy Loading)
- **Angular Material**: UI consistente y profesional siguiendo Material Design
- **TypeScript Estricto**: Código robusto y mantenible
- **Autenticación**: Sistema de login con guardia de rutas
- **Responsive Design**: Adaptable a dispositivos móviles y de escritorio
- **Heurísticas de Nielsen**: Implementación de principios UX/UI

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Angular CLI 19

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd MediSupply-angular
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm start
```

4. Abrir el navegador en `http://localhost:4200`

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                      # Servicios singleton y guardias
│   │   ├── guards/
│   │   │   └── auth.guard.ts      # Guardia de autenticación
│   │   └── services/
│   │       └── auth.service.ts    # Servicio de autenticación
│   │
│   ├── features/                  # Módulos de funcionalidad
│   │   ├── auth/                  # Módulo de autenticación
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   └── auth.routes.ts
│   │   │
│   │   └── dashboard/             # Módulo del dashboard
│   │       ├── dashboard-layout/
│   │       ├── proveedores/
│   │       │   ├── registrar-proveedor/
│   │       │   ├── proveedores.component.ts
│   │       │   ├── proveedores.component.html
│   │       │   └── proveedores.component.scss
│   │       ├── vendedores/
│   │       ├── productos/
│   │       ├── planes-venta/
│   │       ├── rutas/
│   │       └── dashboard.routes.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── styles.scss                    # Estilos globales
└── index.html

```

## 🎨 Módulos Implementados

### Módulo de Autenticación (AuthModule)

- **LoginComponent**: Pantalla de inicio de sesión
  - Formulario reactivo con validación
  - Feedback visual del estado de carga
  - Opción de "Recordarme"
  - Enlaces a recuperación de contraseña y registro

### Módulo del Dashboard (DashboardModule)

- **DashboardLayoutComponent**: Layout principal con:
  - Navegación lateral responsiva
  - Barra superior con acciones
  - Área de contenido principal
  
- **ProveedoresComponent**: Gestión de proveedores
  - Tabla de proveedores
  - Filtros de búsqueda
  - Modal de registro

- **RegistrarProveedorComponent**: Modal para registrar proveedores
  - Formulario completo de datos
  - Carga de documentos certificados
  - Validaciones en tiempo real

- **Otros módulos**: Vendedores, Productos, Planes de Venta, Rutas (en desarrollo)

## 🔐 Autenticación

El sistema incluye un servicio de autenticación simulado. Para iniciar sesión, utiliza cualquier correo electrónico válido y contraseña.

Credenciales de ejemplo:
- Email: admin@medysupply.com
- Contraseña: cualquiera

## 🎨 Temas y Estilos

La aplicación utiliza una paleta de colores basada en tonos morados (Deep Purple) para mantener consistencia con el diseño de referencia:

- Color primario: `#673AB7`
- Color de acento: Deep Purple A200
- Tipografía: Roboto

## 📱 Responsive Design

La aplicación está optimizada para:
- Dispositivos móviles (< 480px)
- Tablets (480px - 768px)
- Escritorio (> 768px)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia servidor de desarrollo
npm run build          # Construye la aplicación
npm run watch          # Construye en modo watch
npm test               # Ejecuta pruebas unitarias
```

## 🏗️ Principios de Diseño (Heurísticas de Nielsen)

1. **H-1: Visibilidad del estado del sistema**: Spinners de carga, estados de botones
2. **H-3: Control y libertad**: Botones de cancelar, limpiar campos
3. **H-4: Consistencia y estándares**: Uso de Angular Material
4. **H-5: Prevención de errores**: Validación en tiempo real con mensajes claros
5. **H-6: Reconocimiento antes que recuerdo**: Labels y placeholders descriptivos
6. **H-7: Flexibilidad y eficiencia**: Atajos, filtros, navegación clara
7. **H-8: Estética y diseño minimalista**: Interfaz limpia sin elementos innecesarios

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Equipo de Desarrollo MedySupply

## 🙏 Agradecimientos

- Angular Team
- Material Design Team
- Comunidad de desarrolladores Angular