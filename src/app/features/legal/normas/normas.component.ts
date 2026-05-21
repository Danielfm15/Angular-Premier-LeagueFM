import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent } from '../../../shared/components/main-nav/main-nav.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PremierHeaderComponent } from '../../../shared/components/premier-header/premier-header.component';

@Component({
  selector: 'app-normas',
  standalone: true,
  imports: [
    CommonModule,
    PremierHeaderComponent,
    MainNavComponent,
    FooterComponent,
  ],
  templateUrl: './normas.component.html',
  styleUrls: ['./normas.component.scss'],
})
export class NormasComponent {}
