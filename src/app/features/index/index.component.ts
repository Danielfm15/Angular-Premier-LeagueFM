import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PremierHeaderComponent } from '../../shared/components/premier-header/premier-header.component';
import { AuthStore } from '../../core/services/auth.store';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterLink, PremierHeaderComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {

  private authStore = inject(AuthStore);

  /** Saber si el usuario está logueado */
  isLoggedIn(): boolean {
    return this.authStore.isLoggedIn();
  }

  /** Cerrar sesión */
  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authStore.clear();
    }
  }
}