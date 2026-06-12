import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PrediccionService } from 'src/app/services/prediccion-service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';
import { PrediccionDatosModelos } from './prediccion-datos-modelos/prediccion-datos-modelos';
import { PrediccionDatosDefinitivo } from "./prediccion-datos-definitivo/prediccion-datos-definitivo";
import { PrediccionDatosExplicativa } from "./prediccion-datos-explicativa/prediccion-datos-explicativa";

@Component({
  selector: 'prediccion-datos',
  imports: [TranslateModule, PrediccionDatosModelos, PrediccionDatosDefinitivo, PrediccionDatosExplicativa],
  templateUrl: './prediccion-datos.html'
})
export class PrediccionDatos {
  Object = Object;
  prediccionService = inject(PrediccionService);
  languageService = inject(LanguageService)
}
