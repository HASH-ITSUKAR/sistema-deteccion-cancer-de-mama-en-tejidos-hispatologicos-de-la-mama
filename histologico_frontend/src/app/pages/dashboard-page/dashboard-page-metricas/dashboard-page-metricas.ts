import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-page-metricas',
  imports: [TranslateModule],
  templateUrl: './dashboard-page-metricas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageMetricas {}
