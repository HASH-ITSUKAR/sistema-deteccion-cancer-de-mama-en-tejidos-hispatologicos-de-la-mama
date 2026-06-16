import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-metricas-modelo',
  imports: [TranslateModule],
  templateUrl: './metricas-modelo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricasModelo {
  nombre = input<string>('Modelo');
  tipo = input<string>('Transformer');
  accuracy = input<string>('--.-%');
  auc = input<string>('--.-%');
  f1 = input<string>('--.-%');
  mcc = input<string>('-.---');
  loss = input<string>('-.----');
}
