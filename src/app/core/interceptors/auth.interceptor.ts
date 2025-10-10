import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para agregar el token de autenticación a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('access_token');

  // Si existe el token y la petición no es de login, agregar el header
  if (token && !req.url.includes('/auth/login')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
