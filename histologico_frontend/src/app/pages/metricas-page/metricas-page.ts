import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MetricasModelo } from "./metricas-modelo/metricas-modelo";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-metricas-page',
  imports: [MetricasModelo, TranslateModule],
  templateUrl: './metricas-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricasPage {}
