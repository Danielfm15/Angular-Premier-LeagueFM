import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasificacionService, EquipoClasificacion } from '../../core/services/clasificacion.service';

import { PremierHeaderComponent } from '../../shared/components/premier-header/premier-header.component';
import { MainNavComponent } from '../../shared/components/main-nav/main-nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [
    CommonModule,
    PremierHeaderComponent,
    MainNavComponent,
    FooterComponent
  ],
  templateUrl: './clasificacion.component.html',
  styleUrls: ['./clasificacion.component.scss'],
})
export class ClasificacionComponent implements OnInit {

  clasificacion: EquipoClasificacion[] = [];

  constructor(private clasificacionService: ClasificacionService) {}

  ngOnInit(): void {
    this.clasificacionService.obtenerClasificacion().subscribe({
      next: data => {
        this.clasificacion = data;
        console.log('✅ Datos recibidos:', data);
      },
      error: err => console.error('❌ Error Angular:', err),
    });
  }

  filaClase(index: number): string {
    if (index === 0) return 'promotion';
    if (index >= 1 && index <= 4) return 'ucl';
    if (index === 5) return 'uefa';
    if (index >= this.clasificacion.length - 3) return 'relegation';
    return 'middle-tab';
  }
  private readonly escudosMap: Record<string, string> = {
  'Arsenal': 'Arsenal.png',
  'Aston Villa': 'Aston Villa.png',
  'Bournemouth': 'Bournemouth.png',
  'Brentford': 'Brentford.png',
  'Brighton': 'Brighton.png',
  'Burnley': 'Burnley.png',
  'Chelsea': 'Chelsea.png',
  'Crystal Palace': 'Crystal Palace.png',
  'Everton': 'Everton.png',
  'Fulham': 'Fulham.png',
  'Liverpool': 'Liverpool.png',
  'Luton': 'Luton.png',
  'Manchester City': 'Manchester City.png',
  'Manchester United': 'Manchester United.png',
  'Newcastle': 'Newcastle.png',
  'Nottingham Forest': 'Nottingham Forest.png',
  'Sheffield United': 'Sheffield United.png',
  'Tottenham': 'Tottenham.png',
  'West Ham': 'West Ham.png',
  'Wolves': 'Wolves.png',
};

getEscudo(nombreEquipo: string): string | null {
  const archivo = this.escudosMap[nombreEquipo];
  return archivo
    ? `/assets/images/escudos/${archivo}`
    : null;
}
}