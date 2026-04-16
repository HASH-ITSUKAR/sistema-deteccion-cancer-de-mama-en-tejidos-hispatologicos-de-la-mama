// src/app/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  private availableLanguages = [
    'es', 'en', 'it', 'fr', 'pt', 'de', 'ru', 'zh', 'ja', 'ko',
    'ar', 'hi', 'in', 'no', 'tr', 'bn'
  ];
  private defaultLanguage = 'es';

  constructor(private translate: TranslateService) {
    this.initLanguage();
  }

  /** Inicializa el idioma guardado o usa el del navegador / default */
  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang();

    const langToUse =
      savedLang && this.availableLanguages.includes(savedLang)
        ? savedLang
        : browserLang && this.availableLanguages.includes(browserLang)
          ? browserLang
          : this.defaultLanguage;

    this.setLanguage(langToUse);
    this.translate.setDefaultLang(this.defaultLanguage);
  }

  /** Cambia el idioma y lo guarda */
  setLanguage(lang: string): void {
    if (this.availableLanguages.includes(lang)) {
      this.translate.use(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  /** Obtiene el idioma actual */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLanguage;
  }

  /** Idiomas disponibles */
  getAvailableLanguages(): string[] {
    return this.availableLanguages;
  }

  /** Traduce una clave específica */
  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
