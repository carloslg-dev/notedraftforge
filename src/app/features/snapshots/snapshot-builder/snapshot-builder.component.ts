import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map } from 'rxjs';
import { LibraryService } from '../../../core/services/library.service';
import { Song } from '../../../core/models/song';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-snapshot-builder',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, TranslatePipe],
  templateUrl: './snapshot-builder.component.html',
  styleUrls: ['./snapshot-builder.component.scss'],
})
export class SnapshotBuilderComponent implements OnInit {
  private readonly library = inject(LibraryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selection$ = new BehaviorSubject<Set<string>>(new Set());
  private readonly i18n = inject(I18nService);

  readonly lang = this.i18n.lang;
  readonly songs$ = this.library.getSongs();
  readonly selectionState$ = this.selection$.asObservable();
  readonly selectedSongs$ = this.selection$.pipe(
    map((selection) => Array.from(selection))
  );

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

  toggleSong(song: Song): void {
    const next = new Set(this.selection$.value);
    if (next.has(song.id)) {
      next.delete(song.id);
    } else {
      next.add(song.id);
    }
    this.selection$.next(next);
  }

  clearSelection(): void {
    this.selection$.next(new Set());
  }
}
