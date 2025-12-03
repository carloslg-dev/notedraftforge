import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../../core/services/library.service';
import { Song } from '../../../core/models/song';
import { LangCode } from '../../../core/models/lang';

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
  ],
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit {
  private readonly library = inject(LibraryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayLang: LangCode = 'en';
  readonly songs$ = this.library.getSongs();

  ngOnInit(): void {
    this.library
      .init()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  songTitle(song: Song): string {
    return song.title[this.displayLang] ?? Object.values(song.title)[0] ?? 'Untitled';
  }
}
