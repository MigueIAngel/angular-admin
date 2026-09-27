import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'es';
const STORAGE_KEY = 'inventory-admin.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly current = signal<Language>(this.initial());

  init(): void {
    this.use(this.current());
  }

  use(lang: Language): void {
    this.current.set(lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }

  toggle(): void {
    this.use(this.current() === 'en' ? 'es' : 'en');
  }

  private initial(): Language {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch {
      /* storage unavailable */
    }
    return navigator.language.startsWith('es') ? 'es' : 'en';
  }
}
