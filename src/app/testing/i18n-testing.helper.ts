import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/**
 * FakeTranslateLoader for testing purposes
 * Returns a predefined set of translations
 */
export class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const translations: Record<string, any> = {
      es: {
        'COMMON': {
          'ACTIONS': 'Acciones',
          'CANCEL': 'Cancelar',
          'SAVE': 'Guardar',
          'EDIT': 'Editar',
          'DELETE': 'Eliminar',
          'CLOSE': 'Cerrar',
          'LOADING': 'Cargando...',
          'DOCUMENTS': 'Documentos Adjuntados'
        },
        'AUTH': {
          'LOGIN': {
            'ERRORS': {
              'EMAIL_REQUIRED': 'El correo electrónico es obligatorio',
              'EMAIL_INVALID': 'El correo electrónico no es válido',
              'PASSWORD_REQUIRED': 'La contraseña es obligatoria',
              'LOGIN_FAILED': 'Error al iniciar sesión. Verifica tus credenciales.'
            }
          }
        },
        'DASHBOARD': {
          'TITLE': 'Dashboard',
          'MENU': {
            'PROVEEDORES': 'DASHBOARD.MENU.PROVEEDORES',
            'PRODUCTOS': 'DASHBOARD.MENU.PRODUCTOS',
            'VENDEDORES': 'DASHBOARD.MENU.VENDEDORES'
          }
        },
        'PROVEEDORES': {
          'TITLE': 'Proveedores',
          'SUBTITLE': 'Gestiona proveedores de suministros',
          'NEW': 'Registrar Proveedor',
          'LIST_EMPTY': 'Haz clic en "Registrar Proveedor" para agregar un nuevo proveedor',
          'REGISTER': {
            'TITLE': 'Registrar Proveedor'
          },
          'FIELDS': {}
        },
        'PRODUCTOS': {
          'TITLE': 'Productos',
          'SUBTITLE': 'Gestiona productos del inventario',
          'NEW': 'Registrar Producto',
          'BULK_UPLOAD': 'Carga Masiva',
          'LIST_EMPTY': 'Haz clic en "Registrar Producto" para agregar un nuevo producto al inventario.',
          'REGISTER': {
            'TITLE': 'Registrar Producto'
          },
          'FIELDS': {}
        },
        'VENDEDORES': {
          'TITLE': 'Vendedores',
          'SUBTITLE': 'Gestiona vendedores que suministran productos a la compañía',
          'NEW': 'Registrar Vendedor',
          'LIST_EMPTY': 'Haz clic en "Registrar Vendedor" para agregar un nuevo vendedor al sistema.',
          'REGISTER': {
            'TITLE': 'Registrar Vendedor',
            'SUBTITLE': 'Complete la información del vendedor',
            'BASIC_INFO': 'Información Básica'
          },
          'FIELDS': {
            'NOMBRE': 'Nombres',
            'APELLIDOS': 'Apellidos',
            'EMAIL': 'Correo Electrónico',
            'TELEFONO': 'Teléfono',
            'ZONA': 'Zona Asignada',
            'ESTADO': 'Estado'
          }
        }
      }
    };

    return of(translations[lang] || translations['es']);
  }
}
