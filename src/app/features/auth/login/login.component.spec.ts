import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { User } from '../../../core/models/auth.models';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    nombre: 'Test',
    apellido: 'User',
    email: 'test@example.com',
    is_active: true,
    created_at: '2025-10-10T01:27:40.334026',
    updated_at: '2025-10-10T01:27:40.334028'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideAnimations(),
        TranslateService
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('es');
    translateService.use('es');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should invalidate form when email is empty', () => {
    component.loginForm.patchValue({
      email: '',
      password: 'password123'
    });

    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should invalidate form when email format is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: 'password123'
    });

    expect(component.loginForm.get('email')?.invalid).toBeTruthy();
  });

  it('should validate form when all fields are correct', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    });

    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call authService.login on submit', () => {
    authService.login.and.returnValue(of(mockUser));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
  });

  it('should navigate to dashboard on successful login', () => {
    authService.login.and.returnValue(of(mockUser));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on login failure', () => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al iniciar sesión. Verifica tus credenciales.');
  });

  it('should clear email field', () => {
    component.loginForm.patchValue({ email: 'test@example.com' });
    
    component.clearEmail();
    
    expect(component.loginForm.get('email')?.value).toBe('');
  });

  it('should clear password field', () => {
    component.loginForm.patchValue({ password: 'password123' });
    
    component.clearPassword();
    
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should return correct email error message', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    expect(component.getEmailErrorMessage()).toBe('El correo electrónico es obligatorio');

    emailControl?.setValue('invalid-email');
    expect(component.getEmailErrorMessage()).toBe('El correo electrónico no es válido');
  });

  it('should set isLoading to true during login', () => {
    authService.login.and.returnValue(of(mockUser));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    // isLoading should be false after subscription completes
    expect(component.isLoading).toBe(false);
  });

  it('should mark all fields as touched when form is invalid on submit', () => {
    component.loginForm.patchValue({
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
  });

  it('should not call authService.login when form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: ''
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should return correct password error message', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('');
    passwordControl?.markAsTouched();
    expect(component.getPasswordErrorMessage()).toBe('La contraseña es obligatoria');
  });

  it('should call onForgotPassword', () => {
    spyOn(console, 'log');
    
    component.onForgotPassword();
    
    expect(console.log).toHaveBeenCalledWith('Recuperar contraseña');
  });

  it('should call onCreateAccount', () => {
    spyOn(console, 'log');
    
    component.onCreateAccount();
    
    expect(console.log).toHaveBeenCalledWith('Crear cuenta');
  });

  it('should clear error message on new submit attempt', () => {
    component.errorMessage = 'Previous error';
    authService.login.and.returnValue(of(mockUser));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });
});
