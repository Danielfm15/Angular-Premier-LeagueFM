import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MainNavComponent } from '../../../shared/components/main-nav/main-nav.component';
import { PremierHeaderComponent } from '../../../shared/components/premier-header/premier-header.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PremierHeaderComponent, MainNavComponent, FooterComponent],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'],
})
export class ContactoComponent {
  private fb = inject(FormBuilder);

  showSuccess = signal(false);

  // Para _next: volver a /contacto tras FormSubmit (SPA)
  nextUrl = `${window.location.origin}/contacto`;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    mensaje: ['', [Validators.required, Validators.maxLength(300)]],
  });

  remaining = computed(() => {
    const msg = this.form.controls.mensaje.value ?? '';
    return 300 - msg.length;
  });

  // Mantener el comportamiento “cortar a 300” del JS legacy
  onMensajeInput() {
    const ctrl = this.form.controls.mensaje;
    const v = ctrl.value ?? '';
    if (v.length > 300) {
      ctrl.setValue(v.slice(0, 300), { emitEvent: false });
    }
  }

  // Envío: validamos y si ok, mostramos modal y enviamos el form nativo
  onSubmit(formEl: HTMLFormElement) {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.showSuccess.set(true);

    // Mostramos el modal unos instantes antes de enviar
    setTimeout(() => {
      // Envío REAL al endpoint
      formEl.submit();
    }, 700);

    // Por si el navegador vuelve a esta SPA, ocultamos tras 8s
    setTimeout(() => {
      this.showSuccess.set(false);
    }, 8000);
  }

  // Helpers de template
  hasError(controlName: 'nombre' | 'correo' | 'mensaje') {
    const c = this.form.controls[controlName];
    return c.touched && c.invalid;
  }
}
