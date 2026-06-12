import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrediccionFormulario } from "./prediccion-formulario/prediccion-formulario";
import { PrediccionService } from 'src/app/services/prediccion-service';
import { PrediccionDatos } from "./prediccion-datos/prediccion-datos";
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';

@Component({
  selector: 'app-prediccion-page',
  imports: [PrediccionFormulario, PrediccionDatos, TranslateModule],
  templateUrl: './prediccion-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionPage {
  prediccionService = inject(PrediccionService);
  private languageService = inject(LanguageService);

  constructor() {
    const currentLang = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(currentLang);
  }
}
