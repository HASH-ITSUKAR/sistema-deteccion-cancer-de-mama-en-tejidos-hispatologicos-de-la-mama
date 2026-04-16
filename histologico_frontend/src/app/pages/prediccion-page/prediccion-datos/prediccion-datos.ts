import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PrediccionService } from 'src/app/services/prediccion-service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';

@Component({
  selector: 'prediccion-datos',
  imports: [DecimalPipe, TranslateModule],
  templateUrl: './prediccion-datos.html'
})
export class PrediccionDatos {
  Math = Math;
  Object = Object;
  prediccionService = inject(PrediccionService);
  languageService = inject(LanguageService)
}
