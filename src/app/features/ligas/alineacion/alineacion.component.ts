import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LigasService } from '../../../core/services/ligas.service';

import {
  AlineacionService,
  JugadorAlineacion,
  GuardarAlineacionItem,
  AlineacionItemBackend,
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

type FormacionId = '442' | '433' | '4213' | '4231' | '352' | '532';

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
  usuarioId!: number;

  loading = true;
  guardando = false;
  puedeEditar = true;
  jornadaEditable: number | null = null;

  formacion: FormacionId = '442';
  presupuestoInicial = 300_000_000;
  nombreLiga: string = '';

  jugadores: JugadorAlineacion[] = [];

  // Filtros
  filtroNombre    = '';
  filtroPosicion  = '';
  filtroEquipo    = '';
  filtroPuntosMin = 0;

  jugadorSeleccionado: JugadorAlineacion | null = null;

  mensajeAviso: string | null = null;
  tipoAviso: 'error' | 'success' = 'error';
  private timeoutAviso: any = null;

  private snapshotGuardado: Record<SlotId, number | null> | null = null;

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

  private readonly slotPermitidoParaPosicion: Record<string, SlotId[]> = {
    Portero:        ['gk'],
    Defensa:        ['lb', 'lcb', 'rcb', 'rb'],
    Centrocampista: ['ldm', 'rdm', 'cam', 'lw', 'rw'],
    Delantero:      ['lw', 'st', 'rw'],
  };

  // Slots activos según formación (los que se muestran en el campo)
  readonly slotsPorFormacion: Record<FormacionId, SlotId[]> = {
    '442':  ['gk', 'lb', 'lcb', 'rcb', 'rb', 'ldm', 'rdm', 'lw', 'rw', 'st', 'cam'],
    '433':  ['gk', 'lb', 'lcb', 'rcb', 'rb', 'ldm', 'rdm', 'cam', 'lw', 'st', 'rw'],
    '4213': ['gk', 'lb', 'lcb', 'rcb', 'rb', 'ldm', 'rdm', 'cam', 'lw', 'st', 'rw'],
    '4231': ['gk', 'lb', 'lcb', 'rcb', 'rb', 'ldm', 'rdm', 'lw', 'cam', 'rw', 'st'],
    '352':  ['gk', 'lcb', 'rcb', 'cam', 'ldm', 'rdm', 'lw', 'rw', 'lb', 'st', 'rb'],
    '532':  ['gk', 'lb', 'lcb', 'rcb', 'rb', 'cam', 'ldm', 'rdm', 'lw', 'rw', 'st'],
  };

  // Qué tipo de jugador acepta cada slot según la formación
private readonly posicionPorSlotEnFormacion: Record<FormacionId, Partial<Record<SlotId, string[]>>> = {
  '442': {
    gk:  ['Portero'],
    lb:  ['Defensa'], lcb: ['Defensa'], rcb: ['Defensa'], rb: ['Defensa'],
    lw:  ['Centrocampista'], ldm: ['Centrocampista'], rdm: ['Centrocampista'], cam: ['Centrocampista'],
    st:  ['Delantero'], rw: ['Delantero'],
  },
  '433': {
    gk:  ['Portero'],
    lb:  ['Defensa'], lcb: ['Defensa'], rcb: ['Defensa'], rb: ['Defensa'],
    ldm: ['Centrocampista'], cam: ['Centrocampista'], rdm: ['Centrocampista'],
    lw:  ['Delantero'], st: ['Delantero'], rw: ['Delantero'],
  },
  '4213': {
    gk:  ['Portero'],
    lb:  ['Defensa'], lcb: ['Defensa'], rcb: ['Defensa'], rb: ['Defensa'],
    ldm: ['Centrocampista'], rdm: ['Centrocampista'], cam: ['Centrocampista'],
    lw:  ['Delantero'], st: ['Delantero'], rw: ['Delantero'],
  },
  '4231': {
    gk:  ['Portero'],
    lb:  ['Defensa'], lcb: ['Defensa'], rcb: ['Defensa'], rb: ['Defensa'],
    ldm: ['Centrocampista'], rdm: ['Centrocampista'],
    lw:  ['Centrocampista'], cam: ['Centrocampista'], rw: ['Centrocampista'],
    st:  ['Delantero'],
  },
  '352': {
    gk:  ['Portero'],
    lcb: ['Defensa'], lb: ['Defensa'], rcb: ['Defensa'],
    lw:  ['Centrocampista'], ldm: ['Centrocampista'], cam: ['Centrocampista'],
    rdm: ['Centrocampista'], rw: ['Centrocampista'],
    st:  ['Delantero'], rb: ['Delantero'],
  },
  '532': {
    gk:  ['Portero'],
    lb:  ['Defensa'], lcb: ['Defensa'], cam: ['Defensa'], rcb: ['Defensa'], rb: ['Defensa'],
    ldm: ['Centrocampista'], lw: ['Centrocampista'], rdm: ['Centrocampista'],
    st:  ['Delantero'], rw: ['Delantero'],
  },
};

  constructor(
    private route: ActivatedRoute,
    private alineacionService: AlineacionService,
    private authService: AuthService,
    private ligasService: LigasService,
  ) {}

  ngOnInit(): void {
    this.idLiga = Number(this.route.snapshot.paramMap.get('idLiga'));
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.usuarioId = user.id_usuario;
     // Cargar nombre de la liga
  this.ligasService.obtenerClasificacionLiga(this.idLiga).subscribe({
    next: res => this.nombreLiga = res.nombre_liga,
    error: err => console.error('Error cargando nombre de liga', err),
  });
    this.inicializar();
  }

  // =========================
  // SNAPSHOT
  // =========================

  private tomarSnapshot(): Record<SlotId, number | null> {
    const snap = {} as Record<SlotId, number | null>;
    (Object.keys(this.slots) as SlotId[]).forEach(slot => {
      snap[slot] = this.slots[slot].jugador?.id_jugador ?? null;
    });
    return snap;
  }

  snapshotIgualAlActual(): boolean {
    if (!this.snapshotGuardado) return false;
    return (Object.keys(this.slots) as SlotId[]).every(slot => {
      const actual = this.slots[slot].jugador?.id_jugador ?? null;
      return actual === this.snapshotGuardado![slot];
    });
  }

  // =========================
  // GETTERS BOTONES
  // =========================

  get jugadoresEnCampo(): number {
    return (Object.keys(this.slots) as SlotId[])
      .filter(slot => this.slots[slot].jugador !== null).length;
  }

  get puedeGuardar(): boolean {
    if (!this.puedeEditar || this.guardando) return false;
    if (this.jugadoresEnCampo !== 11) return false;
    if (!this.snapshotGuardado) return true;
    return !this.snapshotIgualAlActual();
  }

  get puedeEliminar(): boolean {
    if (!this.puedeEditar || this.guardando) return false;
    if (!this.snapshotGuardado) return false;
    return this.snapshotIgualAlActual();
  }

  // =========================
  // GETTERS DERIVADOS
  // =========================

  get idsJugadoresEnCampo(): Set<string> {
    const ids = new Set<string>();
    (Object.keys(this.slots) as SlotId[]).forEach(slot => {
      const jugador = this.slots[slot].jugador;
      if (jugador) ids.add(String(jugador.id_jugador));
    });
    return ids;
  }

  get jugadoresFiltrados(): JugadorAlineacion[] {
    const nombre   = this.filtroNombre.trim().toLowerCase();
    const pos      = this.filtroPosicion;
    const equipo   = this.filtroEquipo.trim().toLowerCase();
    const puntosMin = Number(this.filtroPuntosMin) || 0;
    const idsEnCampo = this.idsJugadoresEnCampo;

    return this.jugadores.filter(j => {
      const okNombre  = !nombre   || j.nombre.toLowerCase().includes(nombre);
      const okPos     = !pos      || j.posicion === pos;
      const okEquipo  = !equipo   || (j.equipo ?? '').toLowerCase().includes(equipo);
      const okPuntos  = j.puntos >= puntosMin;
      const okDisp    = !idsEnCampo.has(String(j.id_jugador));
      return okNombre && okPos && okEquipo && okPuntos && okDisp;
    });
  }

  get presupuestoGastado(): number {
    let total = 0;
    (Object.keys(this.slots) as SlotId[]).forEach(slot => {
      const jugador = this.slots[slot].jugador;
      if (jugador?.precio) total += jugador.precio;
    });
    return total;
  }

  get presupuestoRestante(): number {
    return this.presupuestoInicial - this.presupuestoGastado;
  }

  // =========================
  // INICIALIZACIÓN
  // =========================

  private inicializar(): void {
    this.loading = true;
    this.alineacionService.obtenerJornadaEditable().subscribe({
      next: res => {
        this.jornadaEditable = res.jornadaEditable;
        this.verificarPermisosYCargarJugadores();
      },
      error: err => {
        console.error('Error obteniendo jornada editable', err);
        this.jornadaEditable = null;
        this.verificarPermisosYCargarJugadores();
      },
    });
  }

  private verificarPermisosYCargarJugadores(): void {
    this.alineacionService.verificarEdicionHabilitada().subscribe({
      next: perm => {
        this.puedeEditar = perm.edicionHabilitada;
        this.cargarJugadores();
      },
      error: err => {
        console.error('Error verificando permisos', err);
        this.puedeEditar = true;
        this.cargarJugadores();
      },
    });
  }

  private cargarJugadores(): void {
    this.alineacionService.obtenerJugadores().subscribe({
      next: data => {
        this.jugadores = data.map(j => ({
          ...j,
          precio: Number(j.precio),
          puntos: Number(j.puntos),
        }));
        this.paginaActual = 1;
        this.cargarAlineacionGuardada();
      },
      error: err => {
        console.error('Error cargando jugadores', err);
        this.loading = false;
      },
    });
  }

  private cargarAlineacionGuardada(): void {
    if (!this.jornadaEditable) {
      this.loading = false;
      return;
    }

    this.alineacionService
      .obtenerAlineacion(this.usuarioId, this.jornadaEditable, this.idLiga)
      .subscribe({
        next: (items: AlineacionItemBackend[]) => {
          if (items.length === 0) {
            this.loading = false;
            return;
          }
          items.forEach(item => {
            const slotId = item.posicion_jugador.toLowerCase() as SlotId;
            if (!(slotId in this.slots)) return;
            const jugador = this.jugadores.find(j => j.id_jugador === item.id_jugador);
            if (jugador) this.slots[slotId].jugador = jugador;
          });
          this.snapshotGuardado = this.tomarSnapshot();
          this.loading = false;
        },
        error: err => {
          console.error('Error cargando alineación guardada', err);
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

  aplicarFiltros(): void { this.paginaActual = 1; }
  paginaAnterior(): void { if (this.paginaActual > 1) this.paginaActual--; }
  paginaSiguiente(): void { if (this.paginaActual < this.totalPaginas) this.paginaActual++; }

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
    if (valor >= 1_000)     return (valor / 1_000).toFixed(0) + ' K';
    return String(valor);
  }

  // =========================
  // SELECCIÓN Y COLOCACIÓN
  // =========================
  seleccionarJugador(j: JugadorAlineacion): void {
    if (!this.puedeEditar) return;
    this.jugadorSeleccionado =
      this.jugadorSeleccionado?.id_jugador === j.id_jugador ? null : j;
  }

  colocarEnSlot(slot: SlotId): void {
    if (!this.puedeEditar) return;

    const slotActual = this.slots[slot].jugador;

    if (!this.jugadorSeleccionado) {
      if (slotActual) {
        this.slots[slot].jugador = null;
        this.mostrarAviso('Jugador eliminado de la alineación', 'success');
      }
      return;
    }

    const jugador = this.jugadorSeleccionado;

    const permitidos = this.slotPermitidoParaPosicion[jugador.posicion] ?? [];
    if (!permitidos.includes(slot)) {
      this.mostrarAviso(`${jugador.posicion} no puede colocarse en esta posición`, 'error');
      return;
    }

    const precioActual = slotActual?.precio ?? 0;
    if (jugador.precio > this.presupuestoRestante + precioActual) {
      this.mostrarAviso('No hay presupuesto suficiente para este jugador', 'error');
      return;
    }

    this.slots[slot].jugador = jugador;
    this.jugadorSeleccionado = null;
    this.mostrarAviso('Jugador añadido a la alineación', 'success');
  }

  limpiarSlot(slot: SlotId): void {
    if (!this.puedeEditar) return;
    this.slots[slot].jugador = null;
  }

  esSeleccionado(j: JugadorAlineacion): boolean {
    return String(this.jugadorSeleccionado?.id_jugador) === String(j.id_jugador);
  }

  // =========================
  // GUARDAR / ELIMINAR
  // =========================
  guardarAlineacion(): void {
    if (!this.puedeGuardar || !this.jornadaEditable) return;

    const alineacion: GuardarAlineacionItem[] = (Object.keys(this.slots) as SlotId[])
      .filter(slot => this.slots[slot].jugador !== null)
      .map(slot => ({
        id:      this.slots[slot].jugador!.id_jugador,
        posicion: slot.toUpperCase(),
        costo:   this.slots[slot].jugador!.precio,
      }));

    this.guardando = true;
    this.alineacionService.guardarAlineacion({
      alineacion,
      usuarioId:  this.usuarioId,
      jornadaId:  this.jornadaEditable,
      idLiga:     this.idLiga,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.snapshotGuardado = this.tomarSnapshot();
        this.mostrarAviso('Alineación guardada correctamente', 'success');
      },
      error: err => {
        console.error('Error guardando alineación', err);
        this.guardando = false;
        this.mostrarAviso('Error al guardar la alineación', 'error');
      },
    });
  }

  eliminarAlineacion(): void {
    if (!this.puedeEliminar || !this.jornadaEditable) return;

    this.alineacionService.eliminarAlineacion({
      usuarioId: this.usuarioId,
      jornadaId: this.jornadaEditable,
    }).subscribe({
      next: () => {
        (Object.keys(this.slots) as SlotId[]).forEach(slot => {
          this.slots[slot].jugador = null;
        });
        this.snapshotGuardado = null;
        this.mostrarAviso('Alineación eliminada correctamente', 'success');
      },
      error: err => {
        console.error('Error eliminando alineación', err);
        this.mostrarAviso('Error al eliminar la alineación', 'error');
      },
    });
  }

  // =========================
  // AVISOS
  // =========================
  private mostrarAviso(mensaje: string, tipo: 'error' | 'success' = 'error'): void {
    if (this.timeoutAviso) {
      clearTimeout(this.timeoutAviso);
      this.timeoutAviso = null;
    }
    this.mensajeAviso = mensaje;
    this.tipoAviso = tipo;
    this.timeoutAviso = setTimeout(() => {
      this.mensajeAviso = null;
      this.timeoutAviso = null;
    }, 1500);
  }

  cambiarFormacion(nuevaFormacion: FormacionId): void {
  const mapaNuevo = this.posicionPorSlotEnFormacion[nuevaFormacion];
  let jugadoresQuitados = 0;

  (Object.keys(this.slots) as SlotId[]).forEach(slot => {
    const jugador = this.slots[slot].jugador;
    if (!jugador) return;

    const posicionesPermitidas = mapaNuevo[slot] ?? [];
    if (!posicionesPermitidas.includes(jugador.posicion)) {
      this.slots[slot].jugador = null;
      jugadoresQuitados++;
    }
  });

  this.formacion = nuevaFormacion;

  if (jugadoresQuitados > 0) {
    this.mostrarAviso(
      `${jugadoresQuitados} jugador${jugadoresQuitados === 1 ? '' : 'es'} retirado${jugadoresQuitados === 1 ? '' : 's'} por cambio de formación`,
      'error'
    );
  }
}
}