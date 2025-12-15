import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LangCode } from '../models/lang';
import { I18nService } from './i18n.service';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent {
  private readonly i18n = inject(I18nService);

  readonly lang = this.i18n.lang;
  readonly langs = this.i18n.supportedLangs;

  changeLang(lang: LangCode): void {
    this.i18n.setLang(lang);
  }
}
