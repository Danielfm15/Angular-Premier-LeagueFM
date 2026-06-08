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
  | 'gk'
  | 'lb'
  | 'lcb'
  | 'rcb'
  | 'rb'
  | 'ldm'
  | 'rdm'
  | 'cam'
  | 'lw'
  | 'st'
  | 'rw';

interface SlotState {
  slot: SlotId;
  jugador: JugadorAlineacion | null;
}

type FormacionId = '442' | '433' | '4213';

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

  // Formación actual
  formacion: FormacionId = '442';

  //Presupuesto
  presupuestoInicial = 300_000_000; // 300 M

  // Jugadores (source of truth)
  jugadores: JugadorAlineacion[] = [];

  // Filtros
  filtroNombre = '';
  filtroPosicion = '';

  // Selección actual
  jugadorSeleccionado: JugadorAlineacion | null = null;

  // Mensajes
  mensajeAviso: string | null = null;
  tipoAviso: 'error' | 'success' = 'error';
  private timeoutAviso: any = null;

  // Slots del campo
  slots: Record<SlotId, SlotState> = {
    gk: { slot: 'gk', jugador: null },
    lb: { slot: 'lb', jugador: null },
    lcb: { slot: 'lcb', jugador: null },
    rcb: { slot: 'rcb', jugador: null },
    rb: { slot: 'rb', jugador: null },
    ldm: { slot: 'ldm', jugador: null },
    rdm: { slot: 'rdm', jugador: null },
    cam: { slot: 'cam', jugador: null },
    lw: { slot: 'lw', jugador: null },
    st: { slot: 'st', jugador: null },
    rw: { slot: 'rw', jugador: null },
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

  // Método de error
  private mostrarAviso(
    mensaje: string,
    tipo: 'error' | 'success' = 'error',
  ): void {
    // si ya hay un aviso visible, no lo renovamos
    if (this.mensajeAviso) return;

    this.mensajeAviso = mensaje;
    this.tipoAviso = tipo;

    this.timeoutAviso = setTimeout(() => {
      this.mensajeAviso = null;
      this.timeoutAviso = null;
    }, 1500);
  }

  // =========================
  // GETTERS DERIVADOS (CLAVE)
  // =========================

  get idsJugadoresEnCampo(): Set<string> {
    const ids = new Set<string>();
    (Object.keys(this.slots) as SlotId[]).forEach((slot) => {
      const jugador = this.slots[slot].jugador;
      if (jugador) ids.add(String(jugador.id_jugador));
    });
    return ids;
  }

  get jugadoresFiltrados(): JugadorAlineacion[] {
    const nombre = this.filtroNombre.trim().toLowerCase();
    const pos = this.filtroPosicion;
    const idsEnCampo = this.idsJugadoresEnCampo;

    return this.jugadores.filter((j) => {
      const okNombre = !nombre || j.nombre.toLowerCase().includes(nombre);
      const okPos = !pos || j.posicion === pos;
      const okDisponible = !idsEnCampo.has(String(j.id_jugador));
      return okNombre && okPos && okDisponible;
    });
  }

  get presupuestoGastado(): number {
  let total = 0;

  (Object.keys(this.slots) as SlotId[]).forEach(slot => {
    const jugador = this.slots[slot].jugador;
    if (jugador?.precio) {
      total += jugador.precio;
    }
  });

  return total;
}

get presupuestoRestante(): number {
  return this.presupuestoInicial - this.presupuestoGastado;
}

  // =========================
  // INICIALIZACIÓN ROBUSTA
  // =========================

  private inicializar(): void {
    this.loading = true;

    this.alineacionService.obtenerJornadaEditable().subscribe({
      next: (res) => {
        this.jornadaEditable = res.jornadaEditable;
        this.verificarPermisosYCargarJugadores();
      },
      error: (err) => {
        console.error('Error obteniendo jornada editable', err);
        this.jornadaEditable = null;
        this.verificarPermisosYCargarJugadores();
      },
    });
  }

  private verificarPermisosYCargarJugadores(): void {
    this.alineacionService.verificarEdicionHabilitada().subscribe({
      next: (perm) => {
        this.puedeEditar = perm.edicionHabilitada;
        this.cargarJugadores();
      },
      error: (err) => {
        console.error('Error verificando permisos', err);
        this.puedeEditar = true; // fallback desarrollo
        this.cargarJugadores();
      },
    });
  }

  private cargarJugadores(): void {
  this.alineacionService.obtenerJugadores().subscribe({
    next: (data) => {
      this.jugadores = data.map(j => ({
        ...j,
        precio: Number(j.precio),
        puntos: Number(j.puntos),
      }));
      this.paginaActual = 1;
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

  // ✅ toggle selección
  if (this.jugadorSeleccionado?.id_jugador === j.id_jugador) {
    this.jugadorSeleccionado = null;
  } else {
    this.jugadorSeleccionado = j;
  }
}

  colocarEnSlot(slot: SlotId): void {
  if (!this.puedeEditar) return;

  const slotActual = this.slots[slot].jugador;

  // Sin jugador seleccionado: quitar el del slot (si lo hay)
  if (!this.jugadorSeleccionado) {
    if (slotActual) {
      this.slots[slot].jugador = null;
      this.mostrarAviso('Jugador eliminado de la alineación', 'success');
    }
    return;
  }

  const jugador = this.jugadorSeleccionado;

  // Validar compatibilidad posición ↔ slot ANTES de tocar el slot
  const permitidos = this.slotPermitidoParaPosicion[jugador.posicion] ?? [];
  if (!permitidos.includes(slot)) {
    this.mostrarAviso(
      `${jugador.posicion} no puede colocarse en esta posición`,
      'error'
    );
    return; // ← no toca el slot
  }

  // Validar presupuesto (descontando el jugador que ya ocupa el slot)
  const precioActual = slotActual?.precio ?? 0;
  if (jugador.precio > this.presupuestoRestante + precioActual) {
    this.mostrarAviso('No hay presupuesto suficiente para este jugador', 'error');
    return;
  }

  // Todo OK: asignar (hace swap automático si había jugador)
  this.slots[slot].jugador = jugador;
  this.jugadorSeleccionado = null;
  this.mostrarAviso('Jugador añadido a la alineación', 'success');
}



  limpiarSlot(slot: SlotId): void {
    if (!this.puedeEditar) return;
    this.slots[slot].jugador = null;
  }

  esSeleccionado(j: JugadorAlineacion): boolean {
    return (
      String(this.jugadorSeleccionado?.id_jugador) === String(j.id_jugador)
    );
  }
}
