import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ResultadoPredicciones } from '../interfaces/prediccion/ResultadosPrediccion';
import { Observable, tap } from 'rxjs';
import { PrediccionReportService } from '../reports/prediccion-report';

@Injectable({ providedIn: 'root' })
export class PrediccionService {
  private urlImagen = '';
  private apiUrl = 'http://localhost:5000';
  private http = inject(HttpClient);
  public prediccion = signal<ResultadoPredicciones | null>(null);
  prediccionReportService = inject(PrediccionReportService);

  predecir(imagen: File): Observable<ResultadoPredicciones> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    return this.http.post<ResultadoPredicciones>(`${this.apiUrl}/predecir`, formData).pipe(
      tap((res) => {
        this.prediccion.set(res);
      })
    );

  };

  generarReportePDF(resultados :ResultadoPredicciones ,imagePreviewUrl :string){
    this.prediccionReportService.generarReportePDF(resultados, imagePreviewUrl);
  }

  getUrlImagen(){
    return this.urlImagen
  }

  setUrlImagen(urlImagen :string){
    return this.urlImagen = urlImagen
  }
}
