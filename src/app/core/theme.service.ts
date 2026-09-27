import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'inventory-admin.dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly dark = signal(this.initial());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
      try {
        localStorage.setItem(STORAGE_KEY, String(this.dark()));
      } catch {
        /* storage unavailable */
      }
    });
  }

  toggle(): void {
    this.dark.update((value) => !value);
  }

  private initial(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
