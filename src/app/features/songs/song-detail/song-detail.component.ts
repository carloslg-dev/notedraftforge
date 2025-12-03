import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../../core/services/library.service';
import { Song, SongBlock } from '../../../core/models/song';
import { LangCode } from '../../../core/models/lang';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.scss'],
})
export class SongDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly library = inject(LibraryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayLang: LangCode = 'en';

  readonly song$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => this.library.getSongById(id ?? '')),
    takeUntilDestroyed(this.destroyRef)
  );

  songTitle(song: Song): string {
    return song.title[this.displayLang] ?? Object.values(song.title)[0] ?? 'Untitled';
  }

  blockLyrics(block: SongBlock): string {
    return block.lyrics[this.displayLang] ?? Object.values(block.lyrics)[0] ?? '';
  }

  hasChordChange(block: SongBlock, previous?: SongBlock): boolean {
    return !!block.chord && block.chord !== previous?.chord;
  }
}
