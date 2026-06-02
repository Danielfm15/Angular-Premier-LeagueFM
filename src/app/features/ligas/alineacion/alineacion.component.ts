import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AlineacionService,
  JugadorAlineacion,
} from '../../../core/services/alineacion.service';

import { PremierHeaderComponent } from '../../../shared/components/premier-header/premier-header.component';
import { MainNavComponent } from '../../../shared/components/main-nav/main-nav.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

type SlotId =
  | 'gk' | 'lb' | 'lcb' | 'rcb' | 'rb'
  | 'ldm' | 'rdm' | 'cam'
  | 'lw' | 'st' | 'rw';

interface SlotState {
  slot: SlotId;
  jugador: JugadorAlineacion | null;
}

@Component({
  selector: 'app-alineacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PremierHeaderComponent,
    MainNavComponent,
    FooterComponent,
  ],
  templateUrl: './alineacion.component.html',
  styleUrls: ['./alineacion.component.scss'],
})
export class AlineacionComponent implements OnInit {
  idLiga!: number;

  loading = true;
  puedeEditar = true;
  jornadaEditable: number | null = null;

  // ✅ FORMACIÓN ACTUAL (USADA POR EL HTML + SCSS)
  formacion: '442' | '433' = '442';

  // Jugadores + filtros
  jugadores: JugadorAlineacion[] = [];
  jugadoresFiltrados: JugadorAlineacion[] = [];

  filtroNombre = '';
  filtroPosicion = '';

  // Selección actual (panel derecho)
  jugadorSeleccionado: JugadorAlineacion | null = null;

  // Slots del campo
  slots: Record<SlotId, SlotState> = {
    gk:  { slot: 'gk',  jugador: null },
    lb:  { slot: 'lb',  jugador: null },
    lcb: { slot: 'lcb', jugador: null },
    rcb: { slot: 'rcb', jugador: null },
    rb:  { slot: 'rb',  jugador: null },
    ldm: { slot: 'ldm', jugador: null },
    rdm: { slot: 'rdm', jugador: null },
    cam: { slot: 'cam', jugador: null },
    lw:  { slot: 'lw',  jugador: null },
    st:  { slot: 'st',  jugador: null },
    rw:  { slot: 'rw',  jugador: null },
  };

  // Compatibilidad jugador.posicion -> slots permitidos
  private readonly slotPermitidoParaPosicion: Record<string, SlotId[]> = {
    Portero: ['gk'],
    Defensa: ['lb', 'lcb', 'rcb', 'rb'],
    Centrocampista: ['ldm', 'rdm', 'cam'],
    Delantero: ['lw', 'st', 'rw'],
  };

  constructor(
    private route: ActivatedRoute,
    private alineacionService: AlineacionService,
  ) {}

  ngOnInit(): void {
    this.idLiga = Number(this.route.snapshot.paramMap.get('idLiga'));
    this.inicializar();
  }

  private inicializar(): void {
    this.loading = true;

    this.alineacionService.obtenerJornadaEditable().subscribe({
      next: (res) => {
        this.jornadaEditable = res.jornadaEditable;

        this.alineacionService.verificarEdicionHabilitada().subscribe({
          next: (perm) => {
            this.puedeEditar = perm.edicionHabilitada;
            this.cargarJugadores();
          },
          error: (err) => {
            console.error('Error verificando permisos', err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error obteniendo jornada editable', err);
        this.loading = false;
      },
    });
  }

  private cargarJugadores(): void {
    this.alineacionService.obtenerJugadores().subscribe({
      next: (data) => {
        this.jugadores = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando jugadores', err);
        this.loading = false;
      },
    });
  }

  // =========================
  // PAGINACIÓN
  // =========================
  paginaActual = 1;
  tamanoPagina = 6;

  get totalPaginas(): number {
    return Math.ceil(this.jugadoresFiltrados.length / this.tamanoPagina) || 1;
  }

  get jugadoresPagina(): JugadorAlineacion[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.jugadoresFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  aplicarFiltros(): void {
    const nombre = this.filtroNombre.trim().toLowerCase();
    const pos = this.filtroPosicion;

    this.jugadoresFiltrados = this.jugadores.filter((j) => {
      const okNombre = !nombre || j.nombre.toLowerCase().includes(nombre);
      const okPos = !pos || j.posicion === pos;
      return okNombre && okPos;
    });

    this.paginaActual = 1;
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  // =========================
  // IMÁGENES / FORMATEO
  // =========================
  imgJugador(j: JugadorAlineacion): string {
    const equipo = encodeURIComponent(j.equipo ?? '');
    const nombre = encodeURIComponent(j.nombre ?? '');
    return `/assets/images/jugadores/${equipo}/${nombre}.png`;
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = '/assets/images/jugadores/empty.png';
  }

  abreviarPrecio(valor: number): string {
    if (!valor) return '0';
    if (valor >= 1_000_000) return (valor / 1_000_000).toFixed(1) + ' M';
    if (valor >= 1_000) return (valor / 1_000).toFixed(0) + ' K';
    return String(valor);
  }

  // =========================
  // SELECCIÓN Y COLOCACIÓN
  // =========================
  seleccionarJugador(j: JugadorAlineacion): void {
    if (!this.puedeEditar) return;
    this.jugadorSeleccionado = j;
  }

  colocarEnSlot(slot: SlotId): void {
    if (!this.puedeEditar) return;
    if (!this.jugadorSeleccionado) return;

    const jugador = this.jugadorSeleccionado;

    const permitidos = this.slotPermitidoParaPosicion[jugador.posicion] ?? [];
    if (!permitidos.includes(slot)) {
      console.warn(`⛔ ${jugador.posicion} no puede ir en ${slot}`);
      return;
    }

    const yaAsignado = (Object.keys(this.slots) as SlotId[])
      .find(s => this.slots[s].jugador?.id_jugador === jugador.id_jugador);

    if (yaAsignado) {
      this.slots[yaAsignado].jugador = null;
    }

    this.slots[slot].jugador = jugador;
    this.jugadorSeleccionado = null;
  }

  limpiarSlot(slot: SlotId): void {
    if (!this.puedeEditar) return;
    this.slots[slot].jugador = null;
  }

  esSeleccionado(j: JugadorAlineacion): boolean {
    return this.jugadorSeleccionado?.id_jugador === j.id_jugador;
  }
}