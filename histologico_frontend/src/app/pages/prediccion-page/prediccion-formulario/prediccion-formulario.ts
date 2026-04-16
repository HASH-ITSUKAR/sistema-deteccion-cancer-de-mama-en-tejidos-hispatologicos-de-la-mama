import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PrediccionService } from 'src/app/services/prediccion-service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';

@Component({
  selector: 'prediccion-formulario',
  templateUrl: './prediccion-formulario.html',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
})
export class PrediccionFormulario {
  private fb = inject(FormBuilder);
  private prediccionService = inject(PrediccionService);
  private translate = inject(LanguageService); // 👈

  myForm = this.fb.group({
    imagen: this.fb.control<File | null>(null),
  });
  imagePreviewUrl: string | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert(this.translate.getTranslation('ERROR_ONLY_IMAGES')); // 👈 usa traducción
        return;
      }
      this.myForm.patchValue({ imagen: file });
      if (this.imagePreviewUrl) URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = URL.createObjectURL(file);
      this.prediccionService.setUrlImagen(this.imagePreviewUrl);
    }
  }

  analyzeImage() {
    const imagen = this.myForm.value.imagen;
    if (imagen) {
      this.prediccionService.predecir(imagen).subscribe({
        next: () => {
          console.log('✅ Predicción guardada:', this.prediccionService.prediccion);
        },
        error: (err) => console.error('❌ Error en la API:', err),
      });
    }
  }
}
