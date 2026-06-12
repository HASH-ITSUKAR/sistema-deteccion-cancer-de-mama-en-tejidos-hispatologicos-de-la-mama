import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/languaje-service';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-side-menu-language',
  standalone: true,
  imports: [NgClass, TranslateModule],
  templateUrl: './side-menu-language.html'
})
export class SideMenuLanguage {
  private languageService = inject(LanguageService);

  currentLanguage: string = 'es';
  isOpen: boolean = false;

  languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'in', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  ];

  constructor() {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  changeLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.currentLanguage = langCode;
    this.isOpen = false;
  }

  getCurrentLanguageName(): string {
    return this.languages.find(lang => lang.code === this.currentLanguage)?.name || 'Español';
  }

  getCurrentFlag(): string {
    return this.languages.find(lang => lang.code === this.currentLanguage)?.flag || '🌐';
  }
}
