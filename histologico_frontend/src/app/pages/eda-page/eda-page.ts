import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme-service';

@Component({
  selector: 'app-eda-page',
  imports: [TranslateModule],
  templateUrl: './eda-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdaPage {
  public themeService = inject(ThemeService);
}
