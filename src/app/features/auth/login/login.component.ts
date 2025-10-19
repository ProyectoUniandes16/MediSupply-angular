import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  /**
   * Obtiene el mensaje de error para el campo email
   * H-5: Prevención de errores - Mensajes claros de validación
   */
  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return this.translate.instant('AUTH.LOGIN.ERRORS.EMAIL_REQUIRED');
    }
    if (emailControl?.hasError('email')) {
      return this.translate.instant('AUTH.LOGIN.ERRORS.EMAIL_INVALID');
    }
    return '';
  }

  /**
   * Obtiene el mensaje de error para el campo password
   */
  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return this.translate.instant('AUTH.LOGIN.ERRORS.PASSWORD_REQUIRED');
    }
    if (passwordControl?.hasError('minlength')) {
      return this.translate.instant('AUTH.LOGIN.ERRORS.PASSWORD_MIN');
    }
    return '';
  }

  /**
   * Limpia el campo email
   * H-3: Control y libertad para el usuario
   */
  clearEmail(): void {
    this.loginForm.patchValue({ email: '' });
  }

  /**
   * Limpia el campo password
   * H-3: Control y libertad para el usuario
   */
  clearPassword(): void {
    this.loginForm.patchValue({ password: '' });
  }

  /**
   * Maneja el envío del formulario de login
   * H-1: Visibilidad del estado del sistema - Muestra spinner durante la carga
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.translate.instant('AUTH.LOGIN.ERRORS.LOGIN_FAILED');
          console.error('Login error:', error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Navega a la página de recuperación de contraseña
   */
  onForgotPassword(): void {
    // TODO: Implementar navegación a recuperar contraseña
    console.log('Recuperar contraseña');
  }

  /**
   * Navega a la página de registro
   */
  onCreateAccount(): void {
    // TODO: Implementar navegación a crear cuenta
    console.log('Crear cuenta');
  }
}
