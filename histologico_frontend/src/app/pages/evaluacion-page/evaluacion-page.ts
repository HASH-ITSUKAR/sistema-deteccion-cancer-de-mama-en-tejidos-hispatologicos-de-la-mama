import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, effect, inject } from '@angular/core';

interface MetricasModel {
  auc: number;
  matriz: {
    verdaderos_benignos: number;
    falsos_malignos: number;
    falsos_benignos: number;
    verdaderos_malignos: number;
  };
  puntos_roc: Array<{ x: number; y: number }>;
}

@Component({
  selector: 'app-evaluacion-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluacion-page.html'
})
export class EvaluacionPage implements OnInit {
  private http = inject(HttpClient);

  public listaModelos = ['XgBoost', 'Swin', 'DeiT', 'Inception', 'ViT', 'CaiT', 'EfficientNet', 'DenseNet', 'PVT'];

  // Signals para el estado
  public modeloSeleccionado = signal('XgBoost');
  public datos = signal<MetricasModel | null>(null);
  public stringPathSVG = signal('');

  constructor() {
    // Effect: Se ejecuta automáticamente cada vez que cambia el modelo
    effect(() => {
      this.cargarMetricas(this.modeloSeleccionado());
    });
  }

  ngOnInit(): void {
    // La carga inicial se dispara por el efecto al setear el modelo inicial
  }

  public cambiarModelo(nuevoModelo: string): void {
    this.modeloSeleccionado.set(nuevoModelo);
  }

  private cargarMetricas(nombreModelo: string): void {
    this.http.get<MetricasModel>(`assets/json/roc-matriz/${nombreModelo}.json`).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.generarPathSVG(res);
      },
      error: (err) => console.error(err)
    });
  }

  private generarPathSVG(datos: MetricasModel): void {
    if (!datos.puntos_roc.length) return;
    const tamanoSVG = 256;
    const comandos = datos.puntos_roc.map((punto, index) => {
      return `${index === 0 ? 'M' : 'L'} ${(punto.x * tamanoSVG).toFixed(1)},${((1 - punto.y) * tamanoSVG).toFixed(1)}`;
    });
    this.stringPathSVG.set(comandos.join(' '));
  }
}
