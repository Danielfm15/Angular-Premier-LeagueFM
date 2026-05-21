import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type DropdownKey = 'premier' | 'about' | 'plm' | null;
type Align = 'left' | 'right';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  private host = inject(ElementRef<HTMLElement>);

  openDropdown = signal<DropdownKey>(null);

  /** Alineación del submenu para el dropdown abierto (smart positioning) */
  submenuAlign = signal<Align>('left');

  /** Breakpoint: móvil/tablet (<= 767) */
  isMobile = signal<boolean>(window.innerWidth <= 767);

  @HostListener('window:resize')
  onResize() {
    const mobile = window.innerWidth <= 767;
    const prev = this.isMobile();
    this.isMobile.set(mobile);

    // Al cambiar de modo, cerramos y reseteamos alineación
    if (prev !== mobile) {
      this.openDropdown.set(null);
      this.submenuAlign.set('left');
    } else {
      // Si seguimos en desktop y hay dropdown abierto, recalculamos
      if (!mobile && this.openDropdown()) {
        this.repositionSubmenu();
      }
    }
  }

  /** Desktop: abrir al pasar ratón */
  onEnter(key: Exclude<DropdownKey, null>) {
    if (this.isMobile()) return;
    this.openDropdown.set(key);
    this.repositionSubmenu(); // smart positioning
  }

  /** Desktop: cerrar al salir */
  onLeave(key: Exclude<DropdownKey, null>) {
    if (this.isMobile()) return;
    if (this.openDropdown() === key) {
      this.openDropdown.set(null);
      this.submenuAlign.set('left');
    }
  }

  /** Mobile: toggle por click */
  toggleMobile(key: Exclude<DropdownKey, null>, event: Event) {
    event.preventDefault();
    if (!this.isMobile()) return;

    this.openDropdown.update(current => (current === key ? null : key));
    // En móvil no usamos alineación left/right porque el submenu es bloque (static)
    this.submenuAlign.set('left');
  }

  closeDropdowns() {
    this.openDropdown.set(null);
    this.submenuAlign.set('left');
  }

  /** Cerrar al click fuera */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target) return;

    if (!this.host.nativeElement.contains(target)) {
      this.closeDropdowns();
    }
  }

  /** Confirmación + abrir web oficial */
  openPremierLeagueFixtures(event: Event) {
    event.preventDefault();
    const ok = confirm(
      'Serás redirigido a la página oficial de la Premier League. ¿Deseas continuar?'
    );
    if (ok) {
      window.open('https://www.premierleague.com/fixtures', '_blank');
      this.closeDropdowns();
    }
  }

  /** Smart positioning: evita que el submenu se salga del viewport */
  private repositionSubmenu() {
  if (this.isMobile()) return;

  requestAnimationFrame(() => {
    const key = this.openDropdown();
    if (!key) return;

    const dropdownEl = this.host.nativeElement.querySelector(
      `.dropdown[data-key="${key}"]`
    ) as HTMLElement | null;

    if (!dropdownEl) return;

    const submenuEl = dropdownEl.querySelector('.submenu') as HTMLElement | null;
    if (!submenuEl) return;

    // Reset a izquierda antes de medir
    this.submenuAlign.set('left');

    requestAnimationFrame(() => {
      const rect = submenuEl.getBoundingClientRect();
      const padding = 12;
      const vw = window.innerWidth;

      if (rect.right > vw - padding) {
        this.submenuAlign.set('right');
      } else if (rect.left < padding) {
        this.submenuAlign.set('left');
      }
    });
  });
}
}
