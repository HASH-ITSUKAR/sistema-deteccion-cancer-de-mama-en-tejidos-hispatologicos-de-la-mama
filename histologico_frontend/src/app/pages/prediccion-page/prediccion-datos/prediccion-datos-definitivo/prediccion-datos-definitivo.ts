import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { XGBoostEnsamble } from 'src/app/interfaces/prediccion/ResultadosPrediccion';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';
import { PrediccionService } from 'src/app/services/prediccion-service';
@Component({
  selector: 'app-prediccion-datos-definitivo',
  imports: [
    DecimalPipe,
    TranslateModule,
    TranslateModule
  ],
  templateUrl: './prediccion-datos-definitivo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosDefinitivo {
  xgboost = input.required<XGBoostEnsamble>();
  languageService = inject(LanguageService);
  Math = Math;
  prediccionService = inject(PrediccionService);

  generarReporte() {
    this.prediccionService.generarReportePDF(this.prediccionService.prediccion()!, this.prediccionService.getUrlImagen());
  }
}
