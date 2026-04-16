import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { jsPDF } from 'jspdf';
import { ResultadoPredicciones } from '../interfaces/prediccion/ResultadosPrediccion';
import { fonts } from 'src/utils/fonts';

@Injectable({ providedIn: 'root' })
export class PrediccionReportService {
  reportData = {
    fechaHora: new Date().toLocaleString('es-ES'),
    modeloPrincipal: 'XGBoost Ensemble',
  };

  constructor(private translate: TranslateService) {}

  async generarReportePDF(resultados: ResultadoPredicciones, imagePreviewUrl: string) {
    const doc = new jsPDF();

    try {
      // Configurar fuente y colores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);

      // Título del reporte
      doc.text(this.translate.instant('REPORT.TITLE_MAIN'), 105, 20, { align: 'center' });
      doc.text(this.translate.instant('REPORT.TITLE_SUB'), 105, 30, { align: 'center' });

      // Línea decorativa
      doc.setLineWidth(0.5);
      doc.setDrawColor(100, 100, 100);
      doc.line(20, 35, 190, 35);

      let yPos = 45;

      // SECCIÓN DE IMAGEN
      if (imagePreviewUrl) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(this.translate.instant('REPORT.IMAGE_ANALYZED'), 25, yPos);
        yPos += 10;

        try {
          // Convertir imagen blob a base64 con mejor calidad
          const imageData = await this.processImageForPDF(imagePreviewUrl);

          // Marco decorativo para la imagen
          const frameX = 25;
          const frameY = yPos;
          const frameWidth = 160;
          const frameHeight = 80;

          // Fondo del marco
          doc.setFillColor(250, 250, 250);
          doc.rect(frameX, frameY, frameWidth, frameHeight, 'F');

          // Borde del marco
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(frameX, frameY, frameWidth, frameHeight);

          // Calcular dimensiones para mantener proporción dentro del marco
          const padding = 5;
          const availableWidth = frameWidth - (padding * 2);
          const availableHeight = frameHeight - (padding * 2);

          let imgWidth, imgHeight;

          if (imageData.width / imageData.height > availableWidth / availableHeight) {
            imgWidth = availableWidth;
            imgHeight = (imageData.height * availableWidth) / imageData.width;
          } else {
            imgHeight = availableHeight;
            imgWidth = (imageData.width * availableHeight) / imageData.height;
          }

          // Centrar imagen dentro del marco
          const imgX = frameX + (frameWidth - imgWidth) / 2;
          const imgY = frameY + (frameHeight - imgHeight) / 2;

          // Agregar imagen con calidad mejorada
          doc.addImage(
            imageData.dataURL,
            imageData.format,
            imgX,
            imgY,
            imgWidth,
            imgHeight,
            undefined,
            'FAST'
          );

          yPos += frameHeight + 5;

          // Descripción de la imagen mejorada
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          const imageDescription = this.translate.instant('REPORT.IMAGE_RESOLUTION', {
            width: imageData.width,
            height: imageData.height,
            format: imageData.format
          });
          doc.text(imageDescription, 105, yPos, { align: 'center' });
          yPos += 15;
        } catch (imageError) {
          console.warn('No se pudo cargar la imagen:', imageError);

          // Marco de error
          doc.setFillColor(245, 245, 245);
          doc.rect(25, yPos, 160, 40, 'F');
          doc.setDrawColor(220, 220, 220);
          doc.rect(25, yPos, 160, 40);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(12);
          doc.setTextColor(150, 150, 150);
          doc.text(this.translate.instant('REPORT.IMAGE_UNAVAILABLE'), 105, yPos + 20, { align: 'center' });
          doc.text(this.translate.instant('REPORT.IMAGE_ERROR'), 105, yPos + 30, { align: 'center' });
          yPos += 50;
        }
      }

      // SECCIÓN DE RESULTADOS PRINCIPALES
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(this.translate.instant('REPORT.DIAGNOSIS_RESULT'), 105, yPos, { align: 'center' });

      // Línea decorativa
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(25, yPos + 3, 185, yPos + 3);
      yPos += 15;

      // Predicción final con destacado
      const prediccionFinal = resultados["XGBoost_ensamble"].prediccion;
      const esMaligno = prediccionFinal === 1;

      // Fondo de color para el resultado
      doc.setFillColor(esMaligno ? 255 : 240, esMaligno ? 240 : 255, esMaligno ? 240 : 240);
      doc.rect(25, yPos - 5, 160, 12, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(this.translate.instant('REPORT.DIAGNOSIS'), 30, yPos);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(esMaligno ? 200 : 0, esMaligno ? 50 : 150, esMaligno ? 50 : 0);
      doc.text(
        this.translate.instant(esMaligno ? 'REPORT.MALIGNANT' : 'REPORT.BENIGN'),
        95,
        yPos
      );

      yPos += 20;

      // Confiabilidad con barra visual
      const confianza = esMaligno
        ? (resultados["XGBoost_ensamble"].probabilidades.clase_1 * 100)
        : (resultados["XGBoost_ensamble"].probabilidades.clase_0 * 100);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(this.translate.instant('REPORT.CONFIDENCE_LEVEL'), 25, yPos);

      // Barra de confianza
      const barWidth = 80;
      const barHeight = 6;
      const barX = 95;

      // Fondo de la barra
      doc.setFillColor(220, 220, 220);
      doc.rect(barX, yPos - 3, barWidth, barHeight, 'F');

      // Barra de progreso
      const progressWidth = (confianza / 100) * barWidth;
      doc.setFillColor(
        confianza > 90 ? 0 : confianza > 70 ? 255 : 255,
        confianza > 90 ? 150 : confianza > 70 ? 165 : 100,
        confianza > 90 ? 0 : 0
      );
      doc.rect(barX, yPos - 3, progressWidth, barHeight, 'F');

      // Porcentaje
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(200, 100, 0);
      doc.text(`${confianza.toFixed(1)}%`, barX + barWidth + 5, yPos);

      yPos += 20;

      // Información adicional
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      // Fecha y hora
      doc.setFont('helvetica', 'bold');
      doc.text(this.translate.instant('REPORT.DATE'), 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(this.reportData.fechaHora, 95, yPos);
      yPos += 12;

      // Modelo usado
      doc.setFont('helvetica', 'bold');
      doc.text(this.translate.instant('REPORT.AI_SYSTEM'), 25, yPos);
      doc.setFont('helvetica', 'normal');
      const ensembleText = this.translate.instant('REPORT.ENSEMBLE_MODELS', {
        model: this.reportData.modeloPrincipal
      });
      doc.text(ensembleText, 95, yPos);
      yPos += 20;

      // Verificar si necesitamos nueva página
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      // SECCIÓN DE ANÁLISIS DETALLADO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(this.translate.instant('REPORT.DETAILED_ANALYSIS'), 105, yPos, { align: 'center' });

      // Línea decorativa
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(25, yPos + 3, 185, yPos + 3);
      yPos += 15;

      // Headers de la tabla mejorados
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(70, 130, 180);
      doc.rect(25, yPos - 6, 160, 10, 'F');
      doc.text(this.translate.instant('REPORT.MODEL'), 30, yPos);
      doc.text(this.translate.instant('REPORT.PREDICTION'), 100, yPos);
      doc.text(this.translate.instant('REPORT.CONFIDENCE'), 150, yPos);

      yPos += 12;

      // Datos de otros modelos
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const modelos = ["CaiT", "DeiT", "DenseNet", "EfficientNet", "Inception", "PVT", "Swin", "ViT"];

      for (let i = 0; i < modelos.length; i++) {
        const nombre = modelos[i];
        const modelo = resultados[nombre];

        // Verificar nueva página
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;

          // Repetir headers
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(70, 130, 180);
          doc.rect(25, yPos - 6, 160, 10, 'F');
          doc.text(this.translate.instant('REPORT.MODEL'), 30, yPos);
          doc.text(this.translate.instant('REPORT.PREDICTION'), 100, yPos);
          doc.text(this.translate.instant('REPORT.CONFIDENCE'), 150, yPos);
          yPos += 12;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        }

        // Fondo alterno mejorado
        if (i % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(25, yPos - 5, 160, 9, 'F');
        }

        // Nombre del modelo
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(nombre, 30, yPos);

        // Predicción con iconos
        const esBenigno = modelo.prediccion === 0;
        doc.setTextColor(esBenigno ? 0 : 200, esBenigno ? 150 : 50, esBenigno ? 0 : 50);
        doc.setFont('helvetica', 'bold');
        doc.text(
          this.translate.instant(esBenigno ? 'REPORT.BENIGN_ICON' : 'REPORT.MALIGNANT_ICON'),
          100,
          yPos
        );

        // Confianza con color
        const confianzaModelo = esBenigno
          ? (modelo.probabilidades.clase_0 * 100)
          : (modelo.probabilidades.clase_1 * 100);

        doc.setTextColor(
          confianzaModelo > 90 ? 0 : confianzaModelo > 70 ? 255 : 255,
          confianzaModelo > 90 ? 150 : confianzaModelo > 70 ? 140 : 100,
          confianzaModelo > 90 ? 0 : 0
        );
        doc.setFont('helvetica', 'bold');
        doc.text(`${confianzaModelo.toFixed(1)}%`, 150, yPos);

        yPos += 11;
      }

      // NOTA MÉDICA IMPORTANTE
      yPos += 10;
      doc.setFillColor(255, 248, 220);
      doc.rect(25, yPos - 5, 160, 25, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(180, 120, 0);
      doc.text(this.translate.instant('REPORT.NOTICE_TITLE'), 30, yPos + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 80, 0);
      doc.text(this.translate.instant('REPORT.NOTICE_1'), 30, yPos + 8);
      doc.text(this.translate.instant('REPORT.NOTICE_2'), 30, yPos + 12);
      doc.text(this.translate.instant('REPORT.NOTICE_3'), 30, yPos + 16);

      // Footer mejorado
      yPos += 30;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const footerText = this.translate.instant('REPORT.GENERATED', {
        date: new Date().toLocaleString(this.translate.currentLang === 'es' ? 'es-ES' : 'en-US')
      });
      doc.text(footerText, 105, yPos, { align: 'center' });

      // Guardar el PDF con nombre traducido
      const fileName = this.translate.instant('REPORT.FILENAME', {
        date: new Date().toISOString().split('T')[0]
      });
      doc.save(fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.mostrarError(this.translate.instant('REPORT.ERROR_GENERATING'));
    }
  }

  private async processImageForPDF(url: string): Promise<{
    dataURL: string;
    format: string;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          const maxSize = 2048;
          let canvasWidth = originalWidth;
          let canvasHeight = originalHeight;

          if (Math.max(canvasWidth, canvasHeight) > maxSize) {
            const ratio = Math.min(maxSize / canvasWidth, maxSize / canvasHeight);
            canvasWidth = Math.floor(canvasWidth * ratio);
            canvasHeight = Math.floor(canvasHeight * ratio);
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          this.enhanceImageForMedical(imageData);
          ctx.putImageData(imageData, 0, 0);

          const format = this.detectImageFormat(url);
          const quality = format === 'PNG' ? undefined : 0.95;
          const dataURL = canvas.toDataURL(`image/${format}`, quality);

          resolve({
            dataURL,
            format: format.toUpperCase(),
            width: canvasWidth,
            height: canvasHeight
          });

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('No se pudo cargar la imagen desde la URL'));
      };

      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Timeout al cargar la imagen'));
        }
      }, 10000);

      img.src = url;
    });
  }

  private enhanceImageForMedical(imageData: ImageData): void {
    const data = imageData.data;
    const contrastFactor = 1.1;
    const brightnessFactor = 1.05;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrastFactor + 128 + brightnessFactor));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrastFactor + 128 + brightnessFactor));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrastFactor + 128 + brightnessFactor));
    }
  }

  private detectImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'png':
        return 'png';
      case 'webp':
        return 'jpeg';
      case 'gif':
        return 'jpeg';
      default:
        return 'jpeg';
    }
  }

  private mostrarError(mensaje: string) {
    alert(mensaje);
  }

}
