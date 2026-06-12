import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-prediccion-datos-explicativa',
  imports: [],
  templateUrl: './prediccion-datos-explicativa.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosExplicativa {
  cait_0 = input.required<string>();
  deit_0 = input.required<string>();
  densenet_0 = input.required<string>();
  efficientnet_0 = input.required<string>();
  inception_0 = input.required<string>();
  pvt_0 = input.required<string>();
  swin_0 = input.required<string>();
  vit_0 = input.required<string>();

  cait_1 = input.required<string>();
  deit_1 = input.required<string>();
  densenet_1 = input.required<string>();
  efficientnet_1 = input.required<string>();
  inception_1 = input.required<string>();
  pvt_1 = input.required<string>();
  swin_1 = input.required<string>();
  vit_1 = input.required<string>();
}
