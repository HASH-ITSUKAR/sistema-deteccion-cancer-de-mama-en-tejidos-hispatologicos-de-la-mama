import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';
import { DashboardPageMetricas } from "./dashboard-page-metricas/dashboard-page-metricas";
import { DashboardPageRanking } from "./dashboard-page-ranking/dashboard-page-ranking";

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TranslateModule, DashboardPageMetricas, DashboardPageRanking],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPage {
  // private languageService = inject(LanguageService);

  // constructor() {
  //   const currentLang = this.languageService.getCurrentLanguage();
  //   this.languageService.setLanguage(currentLang);
  // }
}
