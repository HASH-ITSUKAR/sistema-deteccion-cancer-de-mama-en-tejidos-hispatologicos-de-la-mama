import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPage {
  private languageService = inject(LanguageService);

  constructor() {
    const currentLang = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(currentLang);
  }
}
