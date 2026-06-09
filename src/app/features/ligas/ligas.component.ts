import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LigasService } from '../../core/services/ligas.service';

import { AuthUser } from '../../core/models/auth-user.model';
import { Liga } from '../../core/models/liga.model';

import { PremierHeaderComponent } from '../../shared/components/premier-header/premier-header.component';
import { MainNavComponent } from '../../shared/components/main-nav/main-nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-ligas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PremierHeaderComponent,
    MainNavComponent,
    FooterComponent,
  ],
  templateUrl: './ligas.component.html',
  styleUrls: ['./ligas.component.scss'],
})
export class LigasComponent implements OnInit {
  ligas: Liga[] = [];
  loading = true;

  usuario!: AuthUser;
  idUsuario!: number;

  // Feedback
  mensajeExito: string | null = null;
  private timeoutMensaje?: number;

  // ===== Modal Crear Liga =====
  mostrarModalCrear = false;
  nombreNuevaLiga = '';
  creandoLiga = false;

  // ===== Modal Unirse Liga =====
  mostrarModalUnirse = false;
  codigoLiga = '';
  uniendoseLiga = false;

  constructor(
    private ligasService: LigasService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,

    private router: Router,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser()!;
    this.idUsuario = this.usuario.id_usuario;
    this.cargarLigas();
  }

  cargarLigas(): void {
    this.loading = true;

    this.ligasService.obtenerLigasUsuario(this.idUsuario).subscribe({
      next: (res) => {
        this.ligas = res.ligas;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ligas', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // MODAL CREAR LIGA
  // =========================
  abrirModalCrearLiga(): void {
    this.nombreNuevaLiga = '';
    this.mostrarModalCrear = true;
  }

  cerrarModalCrearLiga(): void {
    this.mostrarModalCrear = false;
  }

  confirmarCrearLiga(): void {
    if (!this.nombreNuevaLiga.trim() || this.creandoLiga) return;

    // cerramos modal inmediatamente
    this.mostrarModalCrear = false;
    this.creandoLiga = true;

    const nombreLiga = this.nombreNuevaLiga.trim();
    this.nombreNuevaLiga = '';

    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    this.ligasService.crearLiga(nombreLiga, codigo, this.idUsuario).subscribe({
      next: () => {
        this.creandoLiga = false;
        this.mostrarMensajeExito('Liga creada correctamente');
        this.cargarLigas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear la liga', err);
        this.creandoLiga = false;
        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // MODAL UNIRSE A LIGA
  // =========================
  abrirModalUnirseLiga(): void {
    this.codigoLiga = '';
    this.mostrarModalUnirse = true;
  }

  cerrarModalUnirseLiga(): void {
    this.mostrarModalUnirse = false;
  }

  confirmarUnirseLiga(): void {
    const codigo = this.codigoLiga.trim().toUpperCase();
    if (!codigo || this.uniendoseLiga) return;

    this.mostrarModalUnirse = false;
    this.uniendoseLiga = true;
    this.codigoLiga = '';

    this.ligasService.unirseALiga(codigo, this.idUsuario).subscribe({
      next: (res: any) => {
        this.uniendoseLiga = false;

        if (res?.exito === false) {
          console.warn(res?.mensaje);
          this.cdr.detectChanges();
          return;
        }

        this.mostrarMensajeExito('Te has unido a la liga correctamente');
        this.cargarLigas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al unirse a la liga', err);
        this.uniendoseLiga = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;

    if (this.timeoutMensaje) clearTimeout(this.timeoutMensaje);

    this.timeoutMensaje = window.setTimeout(() => {
      this.mensajeExito = null;
    }, 2500);
  }

  verClasificacion(idLiga: number): void {
    this.router.navigate(['/ligas', idLiga, 'clasificacion']);
  }

  irAlineacion(idLiga: number): void {
    this.router.navigate(['/ligas', idLiga, 'alineacion']);
  }
}
