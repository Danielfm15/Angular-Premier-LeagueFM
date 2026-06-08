import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/services/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);

  isRegisterMode = signal(false);
  showPassword = signal(false);
  showSuccess = signal(false);

  errorMsg = computed(() => this.store.error());
  loading = computed(() => this.store.loading());

  form = this.fb.group({
    nombre: [''],
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(4)]],
  });

  toggleRegisterMode(value: boolean) {
    this.isRegisterMode.set(value);
    this.showSuccess.set(false);
    this.store.error.set(null as any);
    //this.store.clear();

    // Reseteo similar a tu form.reset()
    this.form.reset({ nombre: '', email: '', contrasena: '' });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    const { nombre, email, contrasena } = this.form.value;

    if (!email || !contrasena || (this.isRegisterMode() && !nombre)) {
      this.store.setError('❗ Por favor, completa todos los campos.');
      return;
    }

    // Validación de dominio (copiada de tu JS)
    if (this.isRegisterMode()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/i;
      if (!emailRegex.test(email)) {
        this.store.setError('📧 El correo debe ser de Gmail, Hotmail o Outlook.');
        return;
      }
    }

    this.store.loading.set(true);

    if (this.isRegisterMode()) {
      this.auth.registro(nombre!, email, contrasena).subscribe({
        next: () => {
          this.store.loading.set(false);
          this.showSuccess.set(true);
        },
        error: (err) => {
          this.store.loading.set(false);
          this.store.setError(this.translateBackendError(err?.error?.error));
        }
      });
    } else {
      this.auth.login(email, contrasena).subscribe({
        next: ({ usuario }) => {
          this.store.loading.set(false);
          this.store.setUser(usuario);

          // Antes ibas a principal.html; en Angular iremos a una ruta real (por ahora /jornadas que ya existe)
          this.router.navigateByUrl('/index');
        },
        error: (err) => {
          this.store.loading.set(false);
          this.store.setError(this.translateBackendError(err?.error?.error));
        }
      });
    }
  }

  private translateBackendError(error: string | undefined) {
    switch (error) {
      case 'Usuario no encontrado':
        return '📧 No se encontró ninguna cuenta con ese correo electrónico.';
      case 'Contraseña incorrecta':
        return '🔐 La contraseña que ingresaste no es correcta.';
      case 'El correo electrónico ya está registrado':
        return '⚠️ Ya existe una cuenta registrada con ese correo.';
      case 'Todos los campos son obligatorios':
        return '✏️ Por favor, completa todos los campos requeridos.';
      default:
        return '⚠️ Ocurrió un error inesperado. Inténtalo nuevamente.';
    }
  }
}
