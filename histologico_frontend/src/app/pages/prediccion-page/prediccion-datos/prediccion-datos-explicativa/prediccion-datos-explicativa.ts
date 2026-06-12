import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-prediccion-datos-explicativa',
  imports: [],
  templateUrl: './prediccion-datos-explicativa.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosExplicativa {
  cait = input.required<string>();
  deit = input.required<string>();
  densenet = input.required<string>();
  efficientnet = input.required<string>();
  inception = input.required<string>();
  pvt = input.required<string>();
  swin = input.required<string>();
  vit = input.required<string>();
}
