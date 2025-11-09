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
        COMMON: {
          ACTIONS: 'Acciones',
          CANCEL: 'Cancelar',
          SAVE: 'Guardar',
          EDIT: 'Editar',
          DELETE: 'Eliminar',
          CLOSE: 'Cerrar',
          LOADING: 'Cargando...',
          DOCUMENTS: 'Documentos Adjuntados',
          PAGINATOR: {
            ITEMS_PER_PAGE: 'Elementos por página:',
            NEXT_PAGE: 'Página siguiente',
            PREVIOUS_PAGE: 'Página anterior',
            FIRST_PAGE: 'Primera página',
            LAST_PAGE: 'Última página',
            RANGE_PAGE_LABEL_1: '0 de {{length}}',
            RANGE_PAGE_LABEL_2: '{{startIndex}} - {{endIndex}} de {{length}}'
          }
        },
        AUTH: {
          LOGIN: {
            ERRORS: {
              EMAIL_REQUIRED: 'El correo electrónico es obligatorio',
              EMAIL_INVALID: 'El correo electrónico no es válido',
              PASSWORD_REQUIRED: 'La contraseña es obligatoria',
              LOGIN_FAILED: 'Error al iniciar sesión. Verifica tus credenciales.',
              UNAUTHORIZED_ROLE: 'No tienes permisos para acceder al sistema.'
            }
          }
        },
        DASHBOARD: {
          TITLE: 'Dashboard',
          MENU: {
            PROVEEDORES: 'DASHBOARD.MENU.PROVEEDORES',
            PRODUCTOS: 'DASHBOARD.MENU.PRODUCTOS',
            VENDEDORES: 'DASHBOARD.MENU.VENDEDORES'
          }
        },
        PROVEEDORES: {
          TITLE: 'Proveedores',
          SUBTITLE: 'Gestiona proveedores de suministros',
          NEW: 'Registrar Proveedor',
          LIST_EMPTY: 'Haz clic en "Registrar Proveedor" para agregar un nuevo proveedor',
          REGISTER: {
            TITLE: 'Registrar Proveedor'
          },
          FIELDS: {},
          FILTERS: {
            ALL_COUNTRIES: 'Todos',
            ALL_STATUSES: 'Todos'
          },
          STATUS: {
            ACTIVE: 'Activo',
            INACTIVE: 'Inactivo'
          }
        },
        PRODUCTOS: {
          TITLE: 'Productos',
          SUBTITLE: 'Gestiona productos del inventario',
          NEW: 'Registrar Producto',
          LIST_EMPTY: 'Haz clic en "Registrar Producto" para agregar un nuevo producto al inventario.',
          REGISTER: {
            TITLE: 'Registrar Producto'
          },
          FIELDS: {}
        },
        VENDEDORES: {
          TITLE: 'Vendedores',
          SUBTITLE: 'Gestiona vendedores que suministran productos a la compañía',
          NEW: 'Registrar Vendedor',
          LIST_EMPTY: 'Haz clic en "Registrar Vendedor" para agregar un nuevo vendedor al sistema.',
          REGISTER: {
            TITLE: 'Registrar Vendedor',
            SUBTITLE: 'Complete la información del vendedor',
            BASIC_INFO: 'Información Básica'
          },
          FIELDS: {
            NOMBRE: 'Nombres',
            APELLIDOS: 'Apellidos',
            EMAIL: 'Correo Electrónico',
            TELEFONO: 'Teléfono',
            ZONA: 'Zona Asignada',
            ESTADO: 'Estado'
          },
          TABLE: {
            VIEW_TOOLTIP: 'Ver detalle',
            EDIT_TOOLTIP: 'Editar vendedor'
          },
          DETAIL: {
            TITLE: 'Detalle del Vendedor',
            PERSONAL_INFO: 'Información Personal',
            CONTACT_INFO: 'Información de Contacto',
            WORK_INFO: 'Información Laboral',
            SYSTEM_INFO: 'Información del Sistema',
            ID: 'ID del Vendedor',
            FULL_NAME: 'Nombre Completo',
            CREATED_DATE: 'Fecha de Creación',
            CREATED_BY: 'Creado Por',
            UPDATED_DATE: 'Última Actualización',
            UPDATED_BY: 'Actualizado Por'
          }
        },
        PLANES_VENTA: {
          TITLE: 'Planes de Venta',
          SUBTITLE: 'Gestiona planes de venta para vendedores',
          NEW: 'Agregar Plan',
          REGISTER: {
            TITLE: 'Agregar Plan',
            SUBTITLE: 'Complete la información del proveedor y adjunte las certificaciones sanitarias requeridas',
            METAS: 'Metas',
            SUBMIT: 'Registrar Plan'
          },
          FIELDS: {
            NOMBRE_PLAN: 'Nombre Plan',
            VENDEDOR: 'Seleccione Vendedores',
            ESTADO: 'Seleccione Estado'
          },
          STATUS: {
            ACTIVO: 'Activo',
            INACTIVO: 'Inactivo',
            PENDIENTE: 'Pendiente'
          }
        }
        ,
        PEDIDOS: {
          TITLE: 'Pedidos',
          SUBTITLE: 'Consulta y filtra los pedidos realizados',
          LIST_EMPTY: 'No hay pedidos registrados en el sistema.',
          NO_RESULTS: 'No se encontraron pedidos con los filtros aplicados',
          FILTERS: {
            SELECT_SELLER: 'Seleccione Vendedor',
            CLIENT_ID: 'ID del Cliente'
          }
        }
      },
      en: {
        COMMON: {
          PAGINATOR: {
            ITEMS_PER_PAGE: 'Items per page:',
            NEXT_PAGE: 'Next page',
            PREVIOUS_PAGE: 'Previous page',
            FIRST_PAGE: 'First page',
            LAST_PAGE: 'Last page',
            RANGE_PAGE_LABEL_1: '0 of {{length}}',
            RANGE_PAGE_LABEL_2: '{{startIndex}} – {{endIndex}} of {{length}}'
          }
        }
      }
    };

    return of(translations[lang] || translations['es']);
  }
}
