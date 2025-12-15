import { Injectable, Signal, signal } from '@angular/core';
import { LangCode } from '../models/lang';
import { fallbackLang, supportedLangs, TranslationKey, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'ndf-lang';
  private readonly langSignal = signal<LangCode>(this.initialLang());

  readonly lang: Signal<LangCode> = this.langSignal.asReadonly();

  get supportedLangs(): ReadonlyArray<LangCode> {
    return supportedLangs;
  }

  setLang(lang: LangCode): void {
    if (!supportedLangs.includes(lang)) {
      return;
    }
    this.langSignal.set(lang);
    this.persist(lang);
  }

  translate(key: TranslationKey, lang: LangCode = this.langSignal()): string {
    const langTable = translations[lang];
    const fallbackTable = translations[fallbackLang];
    return langTable?.[key] ?? fallbackTable?.[key] ?? key;
  }

  private initialLang(): LangCode {
    const saved = this.getSavedLang();
    if (saved && supportedLangs.includes(saved)) {
      return saved;
    }
    return supportedLangs[0] ?? fallbackLang;
  }

  private getSavedLang(): LangCode | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const saved = localStorage.getItem(this.storageKey);
    return saved ? (saved as LangCode) : null;
  }

  private persist(lang: LangCode): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(this.storageKey, lang);
    } catch {
      // ignore storage errors
    }
  }
}
