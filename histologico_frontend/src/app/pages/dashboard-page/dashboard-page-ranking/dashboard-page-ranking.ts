import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface ModeloData {
  nombre: string;
  tipo: string;
  accuracy: number;
  auc: number;
  f1: number;
  mcc: number;
}

@Component({
  selector: 'app-dashboard-page-ranking',
  imports: [NgClass, TranslateModule],
  templateUrl: './dashboard-page-ranking.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageRanking {

  metricaSeleccionada = signal<'accuracy' | 'auc' | 'mcc' | 'f1'>('mcc');

  // El arreglo con los 9 modelos exactos y sus métricas en tipo numérico para ordenarse
  modelos = signal<ModeloData[]>([
    { nombre: 'XgBoost', tipo: 'Ensemble', accuracy: 94.07, auc: 98.01, f1: 89.44, mcc: 85.32 },
    { nombre: 'Swin', tipo: 'Transformer', accuracy: 93.05, auc: 97.75, f1: 87.81, mcc: 82.96 },
    { nombre: 'DeiT', tipo: 'Transformer', accuracy: 92.86, auc: 97.56, f1: 87.55, mcc: 82.55 },
    { nombre: 'Inception', tipo: 'CNN', accuracy: 92.74, auc: 97.61, f1: 87.42, mcc: 82.33 },
    { nombre: 'ViT', tipo: 'Transformer', accuracy: 92.68, auc: 97.46, f1: 87.29, mcc: 82.16 },
    { nombre: 'CaiT', tipo: 'Transformer', accuracy: 92.69, auc: 97.51, f1: 87.23, mcc: 82.12 },
    { nombre: 'EfficientNet', tipo: 'CNN', accuracy: 92.63, auc: 97.42, f1: 86.63, mcc: 81.62 },
    { nombre: 'DenseNet', tipo: 'CNN', accuracy: 92.34, auc: 97.20, f1: 86.48, mcc: 81.13 },
    { nombre: 'PVT', tipo: 'Transformer', accuracy: 91.90, auc: 97.14, f1: 86.02, mcc: 80.36  }
  ]);

  // Ranking: Ordenado de Mayor a Menor
  rankingModelos = computed(() => {
    const metrica = this.metricaSeleccionada();
    return [...this.modelos()].sort((a, b) => b[metrica] - a[metrica]);
  });

  // Gráfico: Ordenado de Menor a Mayor (Izquierda más pequeños, derecha más grandes)
  graficoModelos = computed(() => {
    const metrica = this.metricaSeleccionada();
    return [...this.modelos()].sort((a, b) => a[metrica] - b[metrica]);
  });

  cambiarMetrica(metrica: 'accuracy' | 'auc' | 'mcc' | 'f1') {
    this.metricaSeleccionada.set(metrica);
  }

  limitesGrafico = computed(() => {
    const metrica = this.metricaSeleccionada(); // Retorna 'accuracy', 'auc', 'f1' o 'mcc'
    const valores = this.graficoModelos().map(m => m[metrica]);

    const min = Math.min(...valores);
    const max = Math.max(...valores);

    return {
      min: min === max ? min - 1 : min,
      max: max
    };
  });

}
