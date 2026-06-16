import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-eda-page',
  imports: [TranslateModule],
  templateUrl: './eda-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdaPage {}
