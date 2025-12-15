import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../../core/services/library.service';
import { Song } from '../../../core/models/song';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    TranslatePipe,
    MatButtonModule,
  ],
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit {
  private readonly library = inject(LibraryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly lang = this.i18n.lang;
  readonly songs$ = this.library.getSongs();
  importError = '';

  ngOnInit(): void {
    this.library
      .init()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  songTitle(song: Song): string {
    const lang = this.lang();
    return song.title[lang] ?? Object.values(song.title)[0] ?? this.i18n.translate('songs.untitled', lang);
  }

  createNew(): void {
    this.importError = '';
    this.router.navigate(['/songs', 'new']);
  }

  exportSongs(): void {
    const content = this.library.exportSongs();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'songs.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  onImport(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid JSON shape');
        }
        this.library.importSongs(parsed);
        this.importError = '';
      } catch (err) {
        this.importError = this.i18n.translate('songs.importError', this.lang());
        console.error(err);
      } finally {
        if (target) {
          target.value = '';
        }
      }
    };
    reader.readAsText(file);
  }
}
