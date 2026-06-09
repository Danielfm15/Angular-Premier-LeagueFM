import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { PremierHeaderComponent } from '../../shared/components/premier-header/premier-header.component';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MainNavComponent } from '../../shared/components/main-nav/main-nav.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterLink, PremierHeaderComponent, FooterComponent, MainNavComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    
      this.authService.logout();
      this.router.navigateByUrl('/login');
    
  }
}