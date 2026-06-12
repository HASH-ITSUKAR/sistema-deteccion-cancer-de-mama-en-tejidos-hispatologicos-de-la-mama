import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MetricasModelo } from "./metricas-modelo/metricas-modelo";

@Component({
  selector: 'app-metricas-page',
  imports: [MetricasModelo],
  templateUrl: './metricas-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricasPage {}
