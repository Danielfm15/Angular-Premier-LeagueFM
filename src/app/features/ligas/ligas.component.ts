import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';


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
    FooterComponent
  ],
  templateUrl: './ligas.component.html',
  styleUrls: ['./ligas.component.scss'],
})
export class LigasComponent implements OnInit {

  // =========================
  // DATOS
  // =========================
  ligas: Liga[] = [];
  loading = true;

  usuario!: AuthUser;
  idUsuario!: number;

  // =========================
  // FEEDBACK
  // =========================
  mensajeExito: string | null = null;
  private timeoutMensaje?: number;

  // =========================
  // MODAL CREAR LIGA
  // =========================
  mostrarModalCrear = false;
  nombreNuevaLiga = '';
  creandoLiga = false;

  constructor(
    private ligasService: LigasService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser()!;
    this.idUsuario = this.usuario.id_usuario;
    this.cargarLigas();
  }

  // =========================
  // CARGAR LIGAS
  // =========================
  cargarLigas(): void {
    this.loading = true;

    this.ligasService.obtenerLigasUsuario(this.idUsuario).subscribe({
      next: (res) => {
        this.ligas = res.ligas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ligas', err);
        this.loading = false;
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

  // ✅ Cerramos modal inmediatamente
  this.mostrarModalCrear = false;
  this.creandoLiga = true;

  const nombreLiga = this.nombreNuevaLiga.trim();
  this.nombreNuevaLiga = '';

  const codigo = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  this.ligasService
    .crearLiga(nombreLiga, codigo, this.idUsuario)
    .subscribe({
      next: () => {
        this.creandoLiga = false;

        // ✅ Forzar refresco visual
        this.ligas = [];
        this.cargarLigas();

        // ✅ Mensaje de éxito
        this.mostrarMensajeExito('Liga creada correctamente');
      },
      error: (err) => {
        console.error('Error al crear la liga', err);
        this.creandoLiga = false;
      },
    });
}

  private mostrarMensajeExito(mensaje: string): void {
  this.mensajeExito = mensaje;

  // ✅ Forzamos render inmediato
  this.cdr.detectChanges();

  if (this.timeoutMensaje) {
    clearTimeout(this.timeoutMensaje);
  }

  this.timeoutMensaje = window.setTimeout(() => {
    this.mensajeExito = null;
    this.cdr.detectChanges();
  }, 2500);
}

  // =========================
  // UNIRSE / VER LIGA
  // =========================
  unirseLiga(): void {
    // Se implementa en el siguiente paso
  }

  verLiga(idLiga: number): void {
    // Routing a clasificación más adelante
    console.log('Ir a clasificación de liga', idLiga);
  }
}
