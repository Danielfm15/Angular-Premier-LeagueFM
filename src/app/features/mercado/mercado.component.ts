import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MercadoService,
  JugadorMercado,
  MercadoResponse
} from '../../core/services/mercado.service';
import { PremierHeaderComponent } from '../../shared/components/premier-header/premier-header.component';
import { MainNavComponent } from '../../shared/components/main-nav/main-nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mercado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PremierHeaderComponent,
    MainNavComponent,
    FooterComponent
  ],
  templateUrl: './mercado.component.html',
  styleUrls: ['./mercado.component.scss'],
})
export class MercadoComponent implements OnInit {

  jugadores: JugadorMercado[] = [];
  loading = false;

  filtros = {
    nombre: '',
    club: '',
    posicion: '',
    valorMaximo: undefined as number | undefined,
    puntosMinimos: undefined as number | undefined,
  };

  page = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private mercadoService: MercadoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.buscar(true);
  }

  buscar(resetPage = false): void {
    if (resetPage) this.page = 1;

    this.loading = true;

    this.mercadoService
      .obtenerJugadores(this.filtros, this.page, this.pageSize)
      .subscribe({
        next: (res: MercadoResponse) => {
          this.jugadores = res.data;
          this.total = res.total;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error mercado', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  paginaSiguiente(): void {
    if (this.page * this.pageSize < this.total) {
      this.page++;
      this.buscar();
    }
  }

  paginaAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.buscar();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getFotoJugador(jugador: JugadorMercado): string {
    return `/assets/images/jugadores/${jugador.club}/${jugador.imagen}`;
  }

  getEscudo(club: string): string {
    return `/assets/images/escudos/${club}.png`;
  }

  getEstadoIcon(estado: string): string {
    return `/assets/images/iconos/${estado.toLowerCase()}.png`;
  }
}