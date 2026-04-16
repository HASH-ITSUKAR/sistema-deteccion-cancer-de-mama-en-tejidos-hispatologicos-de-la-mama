import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '@environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-side-menu-header',
  imports: [TranslateModule],
  templateUrl: './side-menu-header.html'
})
export class SideMenuHeader {
  envs = environment;
}
