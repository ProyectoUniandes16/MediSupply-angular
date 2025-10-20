# MedySupply - Aplicación Web

Aplicación web SPA (Single Page Application) desarrollada con Angular 19 y Angular Material para la gestión integral de proveedores, vendedores, productos y distribución médica. Implementa las mejores prácticas de desarrollo, pruebas unitarias exhaustivas, internacionalización (i18n) y principios de UX/UI basados en las heurísticas de Nielsen.

## 🚀 Características

- **Arquitectura Modular**: Implementación de módulos de funcionalidad con componentes standalone
- **Angular Material**: UI consistente y profesional siguiendo Material Design
- **TypeScript Estricto**: Código robusto y mantenible con tipos fuertes
- **Autenticación JWT**: Sistema de login con guardia de rutas y manejo de tokens
- **Internacionalización (i18n)**: Soporte para múltiples idiomas (Español e Inglés)
- **Pruebas Unitarias**: Cobertura de código ~87% con Jasmine y Karma
- **Responsive Design**: Adaptable a dispositivos móviles, tablets y escritorio
- **Carga Masiva**: Funcionalidad de importación de productos mediante archivos CSV
- **Heurísticas de Nielsen**: Implementación de 8 principios fundamentales de UX/UI
- **Formularios Reactivos**: Validación en tiempo real con feedback inmediato
- **Gestión de Estado**: Manejo eficiente del estado de la aplicación
- **HTTP Interceptors**: Manejo centralizado de peticiones y tokens

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

```ini
src/
├── app/
│   ├── core/                           # Servicios singleton, guardias e interceptores
│   │   ├── guards/
│   │   │   └── auth.guard.ts           # Guardia de autenticación de rutas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts     # Interceptor HTTP para tokens JWT
│   │   ├── models/
│   │   │   ├── auth.models.ts          # Modelos de autenticación
│   │   │   ├── producto.models.ts      # Modelos de productos
│   │   │   ├── proveedor.models.ts     # Modelos de proveedores
│   │   │   └── vendedor.models.ts      # Modelos de vendedores
│   │   └── services/
│   │       ├── auth.service.ts         # Servicio de autenticación
│   │       ├── auth-http.service.ts    # Servicio HTTP de autenticación
│   │       ├── producto-http.service.ts # Servicio HTTP de productos
│   │       ├── proveedor-http.service.ts # Servicio HTTP de proveedores
│   │       └── vendedor-http.service.ts # Servicio HTTP de vendedores
│   │
│   ├── features/                       # Módulos de funcionalidad
│   │   ├── auth/                       # Módulo de autenticación
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.scss
│   │   │   │   └── login.component.spec.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   └── dashboard/                  # Módulo del dashboard
│   │       ├── dashboard-layout/
│   │       │   ├── dashboard-layout.component.ts
│   │       │   ├── dashboard-layout.component.html
│   │       │   ├── dashboard-layout.component.scss
│   │       │   └── dashboard-layout.component.spec.ts
│   │       │
│   │       ├── proveedores/            # Gestión de proveedores
│   │       │   ├── registrar-proveedor/
│   │       │   │   ├── registrar-proveedor.component.ts
│   │       │   │   ├── registrar-proveedor.component.html
│   │       │   │   ├── registrar-proveedor.component.scss
│   │       │   │   └── registrar-proveedor.component.spec.ts
│   │       │   ├── proveedores.component.ts
│   │       │   ├── proveedores.component.html
│   │       │   ├── proveedores.component.scss
│   │       │   └── proveedores.component.spec.ts
│   │       │
│   │       ├── vendedores/             # Gestión de vendedores
│   │       │   ├── registrar-vendedor/
│   │       │   │   ├── registrar-vendedor.component.ts
│   │       │   │   ├── registrar-vendedor.component.html
│   │       │   │   ├── registrar-vendedor.component.scss
│   │       │   │   └── registrar-vendedor.component.spec.ts
│   │       │   ├── vendedores.component.ts
│   │       │   ├── vendedores.component.html
│   │       │   ├── vendedores.component.scss
│   │       │   └── vendedores.component.spec.ts
│   │       │
│   │       ├── productos/              # Gestión de productos
│   │       │   ├── registrar-producto/
│   │       │   │   ├── registrar-producto.component.ts
│   │       │   │   ├── registrar-producto.component.html
│   │       │   │   ├── registrar-producto.component.scss
│   │       │   │   └── registrar-producto.component.spec.ts
│   │       │   ├── carga-masiva/       # Carga masiva de productos
│   │       │   │   ├── carga-masiva.component.ts
│   │       │   │   ├── carga-masiva.component.html
│   │       │   │   ├── carga-masiva.component.scss
│   │       │   │   └── carga-masiva.component.spec.ts
│   │       │   ├── productos.component.ts
│   │       │   ├── productos.component.html
│   │       │   ├── productos.component.scss
│   │       │   └── productos.component.spec.ts
│   │       │
│   │       └── dashboard.routes.ts
│   │
│   ├── testing/                        # Utilidades de testing
│   │   └── i18n-testing.helper.ts      # Helper para pruebas de i18n
│   │
│   ├── app.component.ts
│   ├── app.component.spec.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
│   └── i18n/                           # Archivos de internacionalización
│       ├── en.json                     # Traducciones en inglés
│       └── es.json                     # Traducciones en español
│
├── environments/                        # Configuración de entornos
│   ├── environment.ts                  # Desarrollo
│   └── environment.prod.ts             # Producción
│
├── styles.scss                         # Estilos globales
├── index.html
└── main.ts


```

## 🎨 Módulos Implementados

### Módulo de Autenticación (AuthModule)

- **LoginComponent**: Pantalla de inicio de sesión
   - Formulario reactivo con validación
   - Feedback visual del estado de carga
   - Opción de "Recordarme"
   - Enlaces a recuperación de contraseña y registro

### Módulo del Dashboard (DashboardModule)

### DashboardLayoutComponent
Layout principal con navegación responsiva que incluye:
- Sidenav colapsable con menú de navegación
- Barra superior con selector de idioma (ES/EN)
- Indicador de ruta activa (breadcrumb)
- Menú de usuario con opción de cerrar sesión
- Adaptación automática a dispositivos móviles

### Módulo de Proveedores
**ProveedoresComponent**: Gestión completa de proveedores
- Tabla con paginación del lado del servidor
- Filtros por nombre, país y estado
- Búsqueda en tiempo real
- Indicadores visuales de estado (chips coloreados)
- Modal de registro integrado

**RegistrarProveedorComponent**: Registro de nuevos proveedores
- Formulario reactivo con validación completa
- Carga múltiple de documentos certificados (PDF, JPG, PNG)
- Validaciones personalizadas (NIT, email, teléfono)
- Vista previa de documentos adjuntos
- Mensajes de error contextuales
- Manejo de errores del backend (409 Conflicto, 400 Bad Request)

### Módulo de Vendedores
**VendedoresComponent**: Gestión de vendedores
- Tabla con información de vendedores
- Filtros y búsqueda
- Estados visuales (activo/inactivo)
- Modal de registro

**RegistrarVendedorComponent**: Registro de vendedores
- Campos separados para nombres y apellidos
- Selección de zona asignada
- Validación de email y teléfono
- Estados de carga y errores
- Soporte multiidioma

### Módulo de Productos
**ProductosComponent**: Gestión del inventario
- Listado de productos con paginación
- Filtros avanzados (categoría, proveedor, estado)
- Acceso rápido a carga masiva
- Modal de registro de producto individual

**RegistrarProductoComponent**: Registro individual
- Formulario con información básica y adicional
- Carga de certificaciones sanitarias
- Validación de SKU único
- Campos calculados (precio de venta con IVA)

**CargaMasivaComponent**: Importación masiva de productos
- Descarga de plantilla CSV
- Drag & drop de archivos
- Validación de formato y contenido
- Historial de cargas con estado
- Vista detallada de errores por fila
- Exportación de reporte de errores
- Indicadores de progreso
- Resumen de resultados (exitosos/fallidos)

### Módulo de Autenticación
**LoginComponent**: Pantalla de inicio de sesión
- Formulario reactivo con validación
- Feedback visual del estado de carga
- Manejo de errores 401 Unauthorized
- Persistencia de sesión opcional
- Enlaces a recuperación de contraseña

## 🔐 Autenticación

El sistema incluye autenticación JWT con interceptores HTTP. Las credenciales se validan contra el backend y el token se almacena localmente.

Credenciales de ejemplo:

- Email: usuario@example.com
- Contraseña: (proporcionada por el backend)

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
npm start                        # Inicia servidor de desarrollo en puerto 4200
npm run build                    # Construye la aplicación para producción
npm run build:dev                # Construye para desarrollo
npm run watch                    # Construye en modo watch
npm test                         # Ejecuta pruebas unitarias
npm run test:coverage            # Ejecuta pruebas con reporte de cobertura
npm run test:headless            # Ejecuta pruebas en modo headless
npm run lint                     # Ejecuta el linter

```

## 🧪 Pruebas Unitarias

El proyecto cuenta con pruebas unitarias exhaustivas utilizando Jasmine y Karma:

**Cobertura actual:**
- Statements: 86.92%
- Branches: 74.72%
- Functions: 83.78%
- Lines: 88.31%

**Componentes con pruebas:**
- ✅ LoginComponent (100% cobertura)
- ✅ DashboardLayoutComponent
- ✅ ProveedoresComponent
- ✅ RegistrarProveedorComponent
- ✅ VendedoresComponent
- ✅ RegistrarVendedorComponent
- ✅ ProductosComponent
- ✅ RegistrarProductoComponent
- ✅ CargaMasivaComponent
- ✅ AuthService
- ✅ AuthGuard
- ✅ AuthInterceptor
- ✅ Servicios HTTP (ProveedorHttpService, VendedorHttpService, ProductoHttpService)

**Ejecutar pruebas:**
```bash
npm test                              # Modo interactivo
npm run test:headless                 # Modo headless (CI/CD)
npm run test:coverage                 # Con reporte de cobertura
```

## 🌐 Internacionalización (i18n)

La aplicación soporta múltiples idiomas mediante @ngx-translate:

**Idiomas soportados:**
- Español (es) - Idioma por defecto
- Inglés (en)

**Características:**
- Cambio de idioma en tiempo real desde el menú superior
- Persistencia de la selección en localStorage
- Traducciones para todos los componentes
- Mensajes de error traducidos
- Placeholders y labels contextuales

**Archivos de traducción:**
- `src/assets/i18n/es.json` - Traducciones en español
- `src/assets/i18n/en.json` - Traducciones en inglés

**Agregar un nuevo idioma:**
1. Crear archivo `src/assets/i18n/[codigo].json`
2. Copiar estructura de es.json
3. Traducir todos los textos
4. Actualizar selector en DashboardLayoutComponent

## 🔌 Integración con Backend

La aplicación se comunica con un backend RESTful mediante servicios HTTP:

**Endpoints principales:**
- `POST /auth/login` - Autenticación de usuarios
- `GET /api/proveedor` - Listar proveedores (con paginación y filtros)
- `POST /api/proveedor` - Crear proveedor
- `GET /api/vendedor` - Listar vendedores
- `POST /api/vendedor` - Crear vendedor
- `GET /api/producto` - Listar productos
- `POST /api/producto` - Crear producto
- `POST /api/producto/carga-masiva` - Importar productos CSV

**Configuración:**
- Variables de entorno en `src/environments/`
- Proxy configuration en `proxy.conf.json` para desarrollo
- Interceptor automático de tokens JWT

**Manejo de errores:**
- Códigos HTTP estándar (400, 401, 404, 409, 500)
- Mensajes de error contextuales
- Reintentos automáticos para errores temporales

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