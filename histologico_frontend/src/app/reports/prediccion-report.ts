import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { jsPDF } from 'jspdf';
import { ResultadoPredicciones } from '../interfaces/prediccion/ResultadosPrediccion';

@Injectable({ providedIn: 'root' })
export class PrediccionReportService {
  reportData = {
    fechaHora: '',
    modeloPrincipal: 'XGBoost Ensemble',
  };

  private colors = {
    primary: [41, 128, 185],     // Azul Institucional (#2980b9)
    darkText: [44, 62, 80],      // Gris Oscuro (#2c3e50)
    lightText: [127, 140, 141],  // Gris Mitad (#7f8c8d)
    bgLight: [248, 249, 250],    // Fondo Gris Claro
    malignant: [192, 57, 43],    // Rojo Suave (#c0392b)
    benign: [39, 174, 96],       // Verde Suave (#27ae60)
    warningBg: [254, 249, 231],  // Fondo Alerta (#fef9e7)
    warningText: [186, 139, 0]   // Texto Alerta
  };

  translate = inject(TranslateService)



  private readonly CONFIG_IDIOMAS: { [key: string]: { locale: string, font: string, footer: string } } = {
  // --- ALFABETO LATINO / CIRÍLICO (Nativos en jsPDF) ---
  'es': { locale: 'es-ES', font: 'helvetica',   footer: 'italic' },
  'en': { locale: 'en-US', font: 'helvetica',   footer: 'italic' },
  'it': { locale: 'it-IT', font: 'helvetica',   footer: 'italic' },
  'fr': { locale: 'fr-FR', font: 'helvetica',   footer: 'italic' },
  'pt': { locale: 'pt-BR', font: 'helvetica',   footer: 'italic' },
  'de': { locale: 'de-DE', font: 'helvetica',   footer: 'italic' },

  'ru': { locale: 'ru-RU', font: 'NotoSans',   footer: 'normal' },

  'no': { locale: 'no-NO', font: 'helvetica',   footer: 'italic' },
  'tr': { locale: 'tr-TR', font: 'helvetica',   footer: 'italic' },
  'in': { locale: 'id-ID', font: 'helvetica',   footer: 'italic' },

  'zh': { locale: 'zh-CN', font: 'NotoSansSC',  footer: 'normal' },
  'ja': { locale: 'ja-JP', font: 'NotoSerifJP', footer: 'normal' },
  'ko': { locale: 'ko-KR', font: 'NotoSansKR',  footer: 'normal' },

  'ar': { locale: 'ar-SA', font: 'NotoSansArabic',     footer: 'normal' },
  'hi': { locale: 'hi-IN', font: 'NotoSansDevanagari', footer: 'normal' },
  'bn': { locale: 'bn-BD', font: 'NotoSansBengali',    footer: 'normal' }
};

  fontPrincipal = 'helvetica';
  estiloFooter = 'italic';

  async generarReportePDF(resultados: ResultadoPredicciones, imagePreviewUrl: string) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const idiomaActual = this.translate.currentLang || 'en';
    const idioma = this.CONFIG_IDIOMAS[idiomaActual] ? idiomaActual : 'en';

    this.fontPrincipal = this.CONFIG_IDIOMAS[idioma].font;
    this.estiloFooter = this.CONFIG_IDIOMAS[idioma].footer;

    if (idioma === 'zh') {
      const fuentesChinas = await import('./fonts/NotoSansSC');
      doc.addFileToVFS('NotoSansSC-Regular.ttf', fuentesChinas.default.regular);
      doc.addFileToVFS('NotoSansSC-Bold.ttf', fuentesChinas.default.bold);
      doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
      doc.addFont('NotoSansSC-Bold.ttf', 'NotoSansSC', 'bold');
    }
    if (idioma === 'ja') {
      const fuentesJaponesas = await import('./fonts/NotoSerifJP'); // Variable renombrada
      doc.addFileToVFS('NotoSerifJP-Regular.ttf', fuentesJaponesas.default.regular);
      doc.addFileToVFS('NotoSerifJP-Bold.ttf', fuentesJaponesas.default.bold);
      doc.addFont('NotoSerifJP-Regular.ttf', 'NotoSerifJP', 'normal');
      doc.addFont('NotoSerifJP-Bold.ttf', 'NotoSerifJP', 'bold');
    }
    if (idioma === 'ko') {
      const fuentesCoreanas = await import('./fonts/NotoSansKR'); // Variable renombrada
      doc.addFileToVFS('NotoSansKR-Regular.ttf', fuentesCoreanas.default.regular);
      doc.addFileToVFS('NotoSansKR-Bold.ttf', fuentesCoreanas.default.bold);
      doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
      doc.addFont('NotoSansKR-Bold.ttf', 'NotoSansKR', 'bold');
    }

    if (idioma === 'ar') {
        const fuentesArabes = await import('./fonts/NotoSansArabic');
        doc.addFileToVFS('NotoSansArabic-Regular.ttf', fuentesArabes.default.regular);
        doc.addFileToVFS('NotoSansArabic-Bold.ttf', fuentesArabes.default.bold);
        doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
        doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'bold');
    }

    if (idioma === 'hi') {
        const fuentesHindi = await import('./fonts/NotoSansDevanagari');
        doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', fuentesHindi.default.regular);
        doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', fuentesHindi.default.bold);
        doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');
        doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');
    }

    if (idioma === 'bn') {
        const fuentesBengali = await import('./fonts/NotoSansBengali');
        doc.addFileToVFS('NotoSansBengali-Regular.ttf', fuentesBengali.default.regular);
        doc.addFileToVFS('NotoSansBengali-Bold.ttf', fuentesBengali.default.bold);
        doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
        doc.addFont('NotoSansBengali-Bold.ttf', 'NotoSansBengali', 'bold');
    }

    if (idioma === 'ru') {
        const fuentesRusas = await import('./fonts/NotoSans');
        doc.addFileToVFS('NotoSans-Regular.ttf', fuentesRusas.default.regular);
        doc.addFileToVFS('NotoSans-Bold.ttf', fuentesRusas.default.bold);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    }

    const localeActual = this.CONFIG_IDIOMAS[idioma].locale;

    this.reportData.fechaHora = new Date().toLocaleString(localeActual, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    try {
      // ----------------------------------------------------
      // HEADER
      // ----------------------------------------------------
      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(20);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.TITLE_MAIN'), 105, 20, { align: 'center' });

      doc.setFont(this.fontPrincipal, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(this.colors.lightText[0], this.colors.lightText[1], this.colors.lightText[2]);
      doc.text(this.translate.instant('REPORT.TITLE_SUB'), 105, 27, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
      doc.line(20, 32, 190, 32);

      let yPos = 40;

      // ----------------------------------------------------
      // SECCIÓN: COMPARATIVA DE IMÁGENES (Original vs Procesada)
      // ----------------------------------------------------
      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.VISUAL_ANALYSIS'), 25, yPos);
      yPos += 5;

      // Configuración de grilla para 2 columnas de imágenes
      const colWidth = 76;
      const colHeight = 55;
      const posX_Original = 25;
      const posX_Procesada = 109;

      // --- RENDER IMAGEN ORIGINAL ---
      if (imagePreviewUrl) {
        try {
          const imgOriginal = await this.processImageForPDF(imagePreviewUrl);
          const labelOriginal = this.translate.instant('REPORT.LABEL_ORIGINAL');
          this.renderImageContainer(doc, imgOriginal, posX_Original, yPos, colWidth, colHeight, labelOriginal);
        } catch (e) {
          const errText = this.translate.instant('REPORT.IMAGE_UNAVAILABLE');
          this.renderErrorContainer(doc, posX_Original, yPos, colWidth, colHeight, errText);
        }
      }

      // --- RENDER IMAGEN PROCESADA MODELO ---
      if (resultados.imagen_procesada_modelo) {
        try {
          const imgProcesada = await this.processImageForPDF(resultados.imagen_procesada_modelo);
          const labelProcesada = this.translate.instant('REPORT.LABEL_PROCESSED');
          this.renderImageContainer(doc, imgProcesada, posX_Procesada, yPos, colWidth, colHeight, labelProcesada);
        } catch (e) {
          const errText = this.translate.instant('REPORT.IMAGE_ERROR');
          this.renderErrorContainer(doc, posX_Procesada, yPos, colWidth, colHeight, errText);
        }
      }

      yPos += colHeight + 12;

      // ----------------------------------------------------
      // SECCIÓN DE RESULTADOS PRINCIPALES (ENSEMBLE)
      // ----------------------------------------------------
      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(13);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.DIAGNOSIS_RESULT'), 25, yPos);
      yPos += 4;

      const prediccionFinal = resultados.XGBoost_ensamble.prediccion;
      const esMaligno = prediccionFinal === 1;
      const colorResultado = esMaligno ? this.colors.malignant : this.colors.benign;

      doc.setFillColor(this.colors.bgLight[0], this.colors.bgLight[1], this.colors.bgLight[2]);
      doc.rect(25, yPos, 160, 15, 'F');
      doc.setDrawColor(230, 235, 240);
      doc.rect(25, yPos, 160, 15);

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.DIAGNOSIS'), 32, yPos + 9.5);

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(15);
      doc.setTextColor(colorResultado[0], colorResultado[1], colorResultado[2]);
      doc.text(this.translate.instant(esMaligno ? 'REPORT.MALIGNANT' : 'REPORT.BENIGN'), 95, yPos + 10);
      yPos += 22;

      // --- CONFIABILIDAD / BARRA DE PROGRESO ---
      const confianza = esMaligno
        ? (resultados.XGBoost_ensamble.probabilidades.clase_1 * 100)
        : (resultados.XGBoost_ensamble.probabilidades.clase_0 * 100);

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.CONFIDENCE_LEVEL'), 25, yPos);

      const barWidth = 70;
      const barHeight = 5;
      const barX = 95;

      doc.setFillColor(235, 240, 245);
      doc.rect(barX, yPos - 4, barWidth, barHeight, 'F');

      const progressWidth = (confianza / 100) * barWidth;
      doc.setFillColor(colorResultado[0], colorResultado[1], colorResultado[2]);
      doc.rect(barX, yPos - 4, progressWidth, barHeight, 'F');

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(`${confianza.toFixed(1)}%`, barX + barWidth + 5, yPos);
      yPos += 12;

      // Metadata básica
      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.DATE'), 25, yPos);
      doc.setFont(this.fontPrincipal, 'normal');
      doc.text(this.reportData.fechaHora, 95, yPos);
      yPos += 6;

      doc.setFont(this.fontPrincipal, 'bold');
      doc.text(this.translate.instant('REPORT.AI_SYSTEM'), 25, yPos);
      doc.setFont(this.fontPrincipal, 'normal');
      const ensembleText = this.translate.instant('REPORT.ENSEMBLE_MODELS', { model: this.reportData.modeloPrincipal });
      doc.text(ensembleText, 95, yPos);
      yPos += 16;

      // ----------------------------------------------------
      // SECCIÓN: ANÁLISIS DETALLADO (TABLA)
      // ----------------------------------------------------
      if (yPos > 210) { doc.addPage(); yPos = 25; }

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(13);
      doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
      doc.text(this.translate.instant('REPORT.DETAILED_ANALYSIS'), 25, yPos);
      yPos += 6;

      doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
      doc.rect(25, yPos - 5, 160, 9, 'F');

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(this.translate.instant('REPORT.MODEL'), 30, yPos + 1);
      doc.text(this.translate.instant('REPORT.PREDICTION'), 95, yPos + 1);
      doc.text(this.translate.instant('REPORT.CONFIDENCE'), 150, yPos + 1);
      yPos += 10;

      const modelos = ["CaiT", "DeiT", "DenseNet", "EfficientNet", "Inception", "PVT", "Swin", "ViT"];

      for (let i = 0; i < modelos.length; i++) {
        const nombre = modelos[i];
        const modelo = resultados.resultados_individuales?.[nombre];

        if (!modelo) continue;

        if (yPos > 270) {
          doc.addPage(); yPos = 25;
          doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
          doc.rect(25, yPos - 5, 160, 9, 'F');
          doc.setFont(this.fontPrincipal, 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(this.translate.instant('REPORT.MODEL'), 30, yPos + 1);
          doc.text(this.translate.instant('REPORT.PREDICTION'), 95, yPos + 1);
          doc.text(this.translate.instant('REPORT.CONFIDENCE'), 150, yPos + 1);
          yPos += 10;
        }

        if (i % 2 === 0) {
          doc.setFillColor(this.colors.bgLight[0], this.colors.bgLight[1], this.colors.bgLight[2]);
          doc.rect(25, yPos - 5, 160, 8, 'F');
        }

        doc.setFont(this.fontPrincipal, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
        doc.text(nombre, 30, yPos);

        const individualMaligno = modelo.prediccion === 1;
        const colorIndividual = individualMaligno ? this.colors.malignant : this.colors.benign;

        doc.setFont(this.fontPrincipal, 'bold');
        doc.setTextColor(colorIndividual[0], colorIndividual[1], colorIndividual[2]);
        doc.text(this.translate.instant(individualMaligno ? 'REPORT.MALIGNANT_ICON' : 'REPORT.BENIGN_ICON'), 95, yPos);

        const confianzaModelo = individualMaligno ? (modelo.probabilidades.clase_1 * 100) : (modelo.probabilidades.clase_0 * 100);
        doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
        doc.text(`${confianzaModelo.toFixed(1)}%`, 150, yPos);

        yPos += 8;
      }

      // ----------------------------------------------------
      // SECCIÓN: IA EXPLICATIVA (XAI) - MAPAS DE CALOR
      // ----------------------------------------------------
      yPos += 5;
      doc.addPage();
      yPos = 25;

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(14);
      doc.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
      doc.text(this.translate.instant('REPORT.XAI_SECTION'), 25, yPos);

      yPos += 5;
      doc.setFont(this.fontPrincipal, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(this.colors.lightText[0], this.colors.lightText[1], this.colors.lightText[2]);
      const xaiDesc = this.translate.instant('REPORT.XAI_DESC');
      const splitDesc = doc.splitTextToSize(xaiDesc, 160);
      doc.text(splitDesc, 25, yPos);
      yPos += (splitDesc.length * 4) + 5;

      const mapWidth = 76;
      const mapHeight = 55;

      for (let i = 0; i < modelos.length; i++) {
        const nombre = modelos[i];
        const modelo = resultados.resultados_individuales?.[nombre];

        if (!modelo) continue;

        if (yPos > 215) {
          doc.addPage();
          yPos = 25;
        }

        doc.setFont(this.fontPrincipal, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);

        const roiTitle = this.translate.instant('REPORT.XAI_ROI_TITLE', { architecture: nombre });
        doc.text(roiTitle, 25, yPos);

        doc.setLineWidth(0.2);
        doc.setDrawColor(210, 215, 220);
        doc.line(25, yPos + 2, 190, yPos + 2);
        yPos += 7;

        // Render Mapa Calor Clase 0 (Benigno)
        if (modelo.mapa_calor_clase_0) {
          try {
            const heatmap0 = await this.processImageForPDF(modelo.mapa_calor_clase_0);
            const labelB = this.translate.instant('REPORT.XAI_HEATMAP_BENIGN');
            this.renderImageContainer(doc, heatmap0, posX_Original, yPos, mapWidth, mapHeight, labelB);
          } catch (e) {
            const err0 = this.translate.instant('REPORT.XAI_ERROR_CLASS_0');
            this.renderErrorContainer(doc, posX_Original, yPos, mapWidth, mapHeight, err0);
          }
        } else {
          const noAttr0 = this.translate.instant('REPORT.XAI_NO_ATTRIBUTION_0');
          this.renderErrorContainer(doc, posX_Original, yPos, mapWidth, mapHeight, noAttr0);
        }

        // Render Mapa Calor Clase 1 (Maligno)
        if (modelo.mapa_calor_clase_1) {
          try {
            const heatmap1 = await this.processImageForPDF(modelo.mapa_calor_clase_1);
            const labelM = this.translate.instant('REPORT.XAI_HEATMAP_MALIGNANT');
            this.renderImageContainer(doc, heatmap1, posX_Procesada, yPos, mapWidth, mapHeight, labelM);
          } catch (e) {
            const err1 = this.translate.instant('REPORT.XAI_ERROR_CLASS_1');
            this.renderErrorContainer(doc, posX_Procesada, yPos, mapWidth, mapHeight, err1);
          }
        } else {
          const noAttr1 = this.translate.instant('REPORT.XAI_NO_ATTRIBUTION_1');
          this.renderErrorContainer(doc, posX_Procesada, yPos, mapWidth, mapHeight, noAttr1);
        }

        yPos += mapHeight + 14;
      }

      // ----------------------------------------------------
      // NOTA MÉDICA DE DESCARGO (NOTICE)
      // ----------------------------------------------------
      if (yPos > 245) { doc.addPage(); yPos = 25; }
      yPos += 2;

      doc.setFillColor(this.colors.warningBg[0], this.colors.warningBg[1], this.colors.warningBg[2]);
      doc.rect(25, yPos, 160, 22, 'F');
      doc.setDrawColor(245, 230, 180);
      doc.rect(25, yPos, 160, 22);

      doc.setFont(this.fontPrincipal, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(this.colors.warningText[0], this.colors.warningText[1], this.colors.warningText[2]);
      doc.text(this.translate.instant('REPORT.NOTICE_TITLE'), 30, yPos + 5);

      doc.setFont(this.fontPrincipal, 'normal');
      doc.setFontSize(8);
      doc.text(this.translate.instant('REPORT.NOTICE_1'), 30, yPos + 10);
      doc.text(this.translate.instant('REPORT.NOTICE_2'), 30, yPos + 14);
      doc.text(this.translate.instant('REPORT.NOTICE_3'), 30, yPos + 18);

      // ----------------------------------------------------
      // FOOTER DINÁMICO POR HOJA
      // ----------------------------------------------------
      const totalPages = doc.getNumberOfPages(); // <-- Corregido para que no use .internal
      const pageHeight = doc.internal.pageSize.height;

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont(this.fontPrincipal, this.estiloFooter);
        doc.setFontSize(8);
        doc.setTextColor(this.colors.lightText[0], this.colors.lightText[1], this.colors.lightText[2]);

        const footerText = this.translate.instant('REPORT.GENERATED', { date: this.reportData.fechaHora });
        const pageLabel = this.translate.instant('REPORT.LABEL_PAGE');

        doc.text(`${footerText}  |  ${pageLabel} ${i} / ${totalPages}`, 105, pageHeight - 10, { align: 'center' });
      }

      const fileName = this.translate.instant('REPORT.FILENAME', {
        date: new Date().toISOString().split('T')[0]
      });
      doc.save(fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.mostrarError(this.translate.instant('REPORT.ERROR_GENERATING'));
    }
  }

  private renderImageContainer(doc: jsPDF, imgData: any, x: number, y: number, w: number, h: number, label: string) {
    doc.setFillColor(this.colors.bgLight[0], this.colors.bgLight[1], this.colors.bgLight[2]);
    doc.rect(x, y, w, h, 'F');

    doc.setDrawColor(225, 228, 232);
    doc.setLineWidth(0.25);
    doc.rect(x, y, w, h);

    const padding = 2;
    const availableWidth = w - (padding * 2);
    const availableHeight = h - (padding * 2);
    let imgW, imgH;

    if (imgData.width / imgData.height > availableWidth / availableHeight) {
      imgW = availableWidth;
      imgH = (imgData.height * availableWidth) / imgData.width;
    } else {
      imgH = availableHeight;
      imgW = (imgData.width * availableHeight) / imgData.height;
    }

    const imgX = x + (w - imgW) / 2;
    const imgY = y + (h - imgH) / 2;

    doc.addImage(imgData.dataURL, imgData.format, imgX, imgY, imgW, imgH, undefined, 'FAST');

    doc.setFont(this.fontPrincipal, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(this.colors.darkText[0], this.colors.darkText[1], this.colors.darkText[2]);
    doc.text(label, x + (w / 2), y + h + 4, { align: 'center' });
  }

  private renderErrorContainer(doc: jsPDF, x: number, y: number, w: number, h: number, errorMsg: string) {
    doc.setFillColor(254, 242, 242);
    doc.rect(x, y, w, h, 'F');
    doc.setDrawColor(248, 113, 113);
    doc.setLineWidth(0.25);
    doc.rect(x, y, w, h);

    doc.setFont(this.fontPrincipal, 'italic');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text(errorMsg, x + (w / 2), y + (h / 2), { align: 'center' });
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
            reject(new Error('No canvas context'));
            return;
          }

          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          const maxSize = 1200;
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
          const quality = format === 'PNG' ? undefined : 0.88;
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

      img.onerror = () => reject(new Error('Img load error'));
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
    if (url.startsWith('data:image/png')) return 'png';
    const extension = url.split('.').pop()?.toLowerCase();
    return (extension === 'png') ? 'png' : 'jpeg';
  }

  private mostrarError(mensaje: string) {
    alert(mensaje);
  }
}
