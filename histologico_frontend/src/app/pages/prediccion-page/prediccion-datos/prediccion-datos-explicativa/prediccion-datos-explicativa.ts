import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrediccionService } from 'src/app/services/prediccion-service';

@Component({
  selector: 'app-prediccion-datos-explicativa',
  imports: [TranslateModule],
  templateUrl: './prediccion-datos-explicativa.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrediccionDatosExplicativa {
  private prediccionService = inject(PrediccionService);

  // Imagen base en Base64 por si el usuario hace clic
  imagenBaseProcesada = this.prediccionService.prediccion()?.imagen_procesada_modelo;

  // Signal para guardar los IDs de las imágenes que están en modo "intercambiado"
  imagenesIntercambiadas = signal<Set<string>>(new Set());

  // INPUTS de Clase 0
  cait_0 = input.required<string>();
  deit_0 = input.required<string>();
  densenet_0 = input.required<string>();
  efficientnet_0 = input.required<string>();
  inception_0 = input.required<string>();
  pvt_0 = input.required<string>();
  swin_0 = input.required<string>();
  vit_0 = input.required<string>();

  // INPUTS de Clase 1
  cait_1 = input.required<string>();
  deit_1 = input.required<string>();
  densenet_1 = input.required<string>();
  efficientnet_1 = input.required<string>();
  inception_1 = input.required<string>();
  pvt_1 = input.required<string>();
  swin_1 = input.required<string>();
  vit_1 = input.required<string>();

  /**
   * Alterna el estado de una imagen específica
   * @param id Identificador único de la tarjeta/clase (ej: 'cait_0')
   */
  conmutarImagen(id: string): void {
    this.imagenesIntercambiadas.update(set => {
      const nuevoSet = new Set(set);
      if (nuevoSet.has(id)) {
        nuevoSet.delete(id);
      } else {
        nuevoSet.add(id);
      }
      return nuevoSet;
    });
  }

  /**
   * Retorna la imagen correspondiente: la original del input o la procesada base64
   */
  obtenerImagenSrc(id: string, imagenOriginal: string): string {
    // Si el ID está en el Set y existe la imagen procesada, la intercambiamos
    if (this.imagenesIntercambiadas().has(id) && this.imagenBaseProcesada) {
      return this.imagenBaseProcesada;
    }
    return imagenOriginal;
  }
}
