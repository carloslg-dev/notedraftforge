import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../../core/services/library.service';
import { Song, SongBlock } from '../../../core/models/song';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.scss'],
})
export class SongDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly library = inject(LibraryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);
  readonly lang = this.i18n.lang;

  readonly song$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => this.library.getSongById(id ?? '')),
    takeUntilDestroyed(this.destroyRef)
  );

  songTitle(song: Song): string {
    const lang = this.lang();
    return song.title[lang] ?? Object.values(song.title)[0] ?? this.i18n.translate('songs.untitled', lang);
  }

  blockLyrics(block: SongBlock): string {
    const lang = this.lang();
    return block.lyrics[lang] ?? Object.values(block.lyrics)[0] ?? '';
  }

  hasChordChange(block: SongBlock, previous?: SongBlock): boolean {
    return !!block.chord && block.chord !== previous?.chord;
  }
}
