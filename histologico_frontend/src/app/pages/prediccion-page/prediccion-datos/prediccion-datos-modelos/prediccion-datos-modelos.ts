import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';
import { DecimalPipe } from '@angular/common';
import { ResultadosIndividuales } from 'src/app/interfaces/prediccion/ResultadosPrediccion';
import { PrediccionService } from 'src/app/services/prediccion-service';
import { take } from 'rxjs';

@Component({
  selector: 'app-prediccion-datos-modelos',
  imports: [TranslateModule, DecimalPipe],
  templateUrl: './prediccion-datos-modelos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosModelos {
  resultados = input.required<{ [key: string]: ResultadosIndividuales }>();
  imagen = input.required<string>();
  original = input.required<string>();
  languageService = inject(LanguageService)
  Object = Object;

  imagePreviewUrl: string | null = null;
}
