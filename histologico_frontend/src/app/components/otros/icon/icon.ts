import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from 'src/app/interfaces/otros/icon';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html'
})
export class IconComponent {
  icon = input.required<Icon>();
}
