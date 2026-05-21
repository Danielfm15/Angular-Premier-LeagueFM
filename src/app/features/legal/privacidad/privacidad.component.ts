import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PremierHeaderComponent } from '../../../shared/components/premier-header/premier-header.component';
import { MainNavComponent } from '../../../shared/components/main-nav/main-nav.component';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, PremierHeaderComponent, FooterComponent, MainNavComponent],
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.scss'],
})
export class PrivacidadComponent {}