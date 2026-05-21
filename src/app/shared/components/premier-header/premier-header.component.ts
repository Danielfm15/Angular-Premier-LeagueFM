import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/services/auth.store';

type Club = { id: string; nombre: string; url: string; img: string };

@Component({
  selector: 'app-premier-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premier-header.component.html',
  styleUrls: ['./premier-header.component.scss'],
})
export class PremierHeaderComponent {
  private auth = inject(AuthStore);
  private router = inject(Router);

  // Misma lista que tu script (20 clubes) [3](https://grupporealemutua-my.sharepoint.com/personal/daniel_fernandez_munoz_realeites_com/Documents/Archivos%20de%20Microsoft%C2%A0Copilot%20Chat/scriptCreadorCabecera.js)
  clubs: Club[] = [
    { id: 'arsenal', nombre: 'Arsenal', url: 'https://www.arsenal.com', img: 'Arsenal.png' },
    { id: 'astonvilla', nombre: 'Aston Villa', url: 'https://www.avfc.co.uk', img: 'Aston Villa.png' },
    { id: 'bournemouth', nombre: 'Bournemouth', url: 'https://www.afcb.co.uk', img: 'Bournemouth.png' },
    { id: 'brentford', nombre: 'Brentford', url: 'https://www.brentfordfc.com', img: 'Brentford.png' },
    { id: 'brighton', nombre: 'Brighton', url: 'https://www.brightonandhovealbion.com', img: 'Brighton.png' },
    { id: 'chelsea', nombre: 'Chelsea', url: 'https://www.chelseafc.com', img: 'Chelsea.png' },
    { id: 'crystalpalace', nombre: 'Crystal Palace', url: 'https://www.cpfc.co.uk', img: 'Crystal Palace.png' },
    { id: 'everton', nombre: 'Everton', url: 'https://www.evertonfc.com', img: 'Everton.png' },
    { id: 'nottinghamforest', nombre: 'Nottingham Forest', url: 'https://www.nottinghamforest.co.uk', img: 'Nottingham Forest.png' },
    { id: 'fulham', nombre: 'Fulham', url: 'https://www.fulhamfc.com', img: 'Fulham.png' },
    { id: 'ipswich', nombre: 'Ipswich Town', url: 'https://www.itfc.co.uk', img: 'Ipswich Town.png' },
    { id: 'leicester', nombre: 'Leicester', url: 'https://www.lcfc.com', img: 'Leicester.png' },
    { id: 'liverpool', nombre: 'Liverpool', url: 'https://www.liverpoolfc.com', img: 'Liverpool.png' },
    { id: 'mancity', nombre: 'Manchester City', url: 'https://www.mancity.com', img: 'Manchester City.png' },
    { id: 'manutd', nombre: 'Manchester United', url: 'https://www.manutd.com', img: 'Manchester United.png' },
    { id: 'newcastle', nombre: 'Newcastle', url: 'https://www.nufc.co.uk', img: 'Newcastle.png' },
    { id: 'southampton', nombre: 'Southampton', url: 'https://www.southamptonfc.com', img: 'Southampton.png' },
    { id: 'tottenham', nombre: 'Tottenham', url: 'https://www.tottenhamhotspur.com', img: 'Tottenham.png' },
    { id: 'westham', nombre: 'West Ham', url: 'https://www.whufc.com', img: 'West Ham.png' },
    { id: 'wolves', nombre: 'Wolves', url: 'https://www.wolves.co.uk', img: 'Wolves.png' },
  ];

  isLoggedIn = computed(() => this.auth.isLoggedIn());

  logout() {
    // Equivalente a tu limpiar sessionStorage + redirect login [3](https://grupporealemutua-my.sharepoint.com/personal/daniel_fernandez_munoz_realeites_com/Documents/Archivos%20de%20Microsoft%C2%A0Copilot%20Chat/scriptCreadorCabecera.js)
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
