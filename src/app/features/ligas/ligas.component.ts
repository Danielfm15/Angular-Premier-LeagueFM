import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { LigasService } from '../../core/services/ligas.service';

import { AuthUser } from '../../core/models/auth-user.model';
import { Liga } from '../../core/models/liga.model';

@Component({
  selector: 'app-ligas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ligas.component.html',
  styleUrls: ['./ligas.component.scss'],
})
export class LigasComponent implements OnInit {

  ligas: Liga[] = [];
  loading = true;

  usuario: AuthUser | null = null;
  idUsuario!: number;

  constructor(
    private ligasService: LigasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.usuario = this.authService.getCurrentUser();
  this.idUsuario = this.usuario!.id_usuario;
  this.cargarLigas();
}

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

  crearLiga(): void {
    const nombre = prompt('Introduce el nombre de la liga');
    if (!nombre) return;

    const codigo = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    this.ligasService.crearLiga(nombre, codigo, this.idUsuario).subscribe({
      next: () => this.cargarLigas(),
      error: () => alert('Error al crear la liga'),
    });
  }

  unirseLiga(): void {
    const codigo = prompt('Introduce el código de la liga');
    if (!codigo) return;

    this.ligasService.unirseALiga(codigo, this.idUsuario).subscribe({
      next: () => this.cargarLigas(),
      error: () => alert('Error al unirse a la liga'),
    });
  }

  verLiga(idLiga: number): void {
    // El routing se añadirá en el siguiente paso
    console.log('Ir a clasificación de liga', idLiga);
  }
}