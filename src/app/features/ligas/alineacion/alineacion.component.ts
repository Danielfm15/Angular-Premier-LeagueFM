import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { AlineacionService } from '../../../core/services/alineacion.service';
import { PremierHeaderComponent } from "../../../shared/components/premier-header/premier-header.component";
import { MainNavComponent } from "../../../shared/components/main-nav/main-nav.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";

@Component({
  selector: 'app-alineacion',
  standalone: true,
  imports: [CommonModule, PremierHeaderComponent, MainNavComponent, FooterComponent],
  templateUrl: './alineacion.component.html',
  styleUrls: ['./alineacion.component.scss'],
})
export class AlineacionComponent implements OnInit {
  idLiga!: number;

  loading = true;
  puedeEditar = true;
  jornadaEditable: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private alineacionService: AlineacionService
  ) {}

  ngOnInit(): void {
    this.idLiga = Number(this.route.snapshot.paramMap.get('idLiga'));
    this.inicializarAlineacion();
  }

  private inicializarAlineacion(): void {
    this.loading = true;

    // 1️⃣ Obtener jornada editable
    this.alineacionService.obtenerJornadaEditable().subscribe({
      next: (res) => {
        this.jornadaEditable = res.jornadaEditable;

        // 2️⃣ Verificar permisos de edición
        this.verificarPermisos();
      },
      error: (err) => {
        console.error('Error obteniendo jornada editable', err);
        this.loading = false;
      },
    });
  }

  private verificarPermisos(): void {
    this.alineacionService.verificarEdicionHabilitada().subscribe({
      next: (res) => {
        this.puedeEditar = res.edicionHabilitada;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error verificando permisos de edición', err);
        this.loading = false;
      },
    });
  }
}
