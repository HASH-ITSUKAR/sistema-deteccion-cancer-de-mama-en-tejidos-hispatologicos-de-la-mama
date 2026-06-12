import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { XGBoostEnsamble } from 'src/app/interfaces/prediccion/ResultadosPrediccion';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';
@Component({
  selector: 'app-prediccion-datos-definitivo',
  imports: [
    DecimalPipe,
    TranslateModule,
  ],
  templateUrl: './prediccion-datos-definitivo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosDefinitivo {
  xgboost = input.required<XGBoostEnsamble>();
  languageService = inject(LanguageService);
  Math = Math;
}
