import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { LigasService } from '../../../core/services/ligas.service';
import { PremierHeaderComponent } from "../../../shared/components/premier-header/premier-header.component";
import { MainNavComponent } from "../../../shared/components/main-nav/main-nav.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";

@Component({
  selector: 'app-clasificacion-liga',
  standalone: true,
  imports: [CommonModule, PremierHeaderComponent, MainNavComponent, FooterComponent],
  templateUrl: './clasificacion-liga.component.html',
  styleUrls: ['./clasificacion-liga.component.scss'],
})
export class ClasificacionLigaComponent implements OnInit {

  idLiga!: number;
  nombreLiga = '';
  clasificacion: { nombre_usuario: string; puntos_totales: number }[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private ligasService: LigasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idLiga = Number(this.route.snapshot.paramMap.get('idLiga'));
    this.cargarClasificacion();
  }

  cargarClasificacion(): void {
    this.loading = true;

    this.ligasService.obtenerClasificacionLiga(this.idLiga).subscribe({
      next: (res: { nombre_liga: string; clasificacion: { nombre_usuario: string; puntos_totales: number; }[]; }) => {
        this.nombreLiga = res.nombre_liga;
        this.clasificacion = res.clasificacion;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando clasificación de liga', err);
        this.loading = false;
      },
    });
  }

  irAlineacion(): void {
    this.router.navigate(['/ligas', this.idLiga, 'alineacion']);
  }
}
``