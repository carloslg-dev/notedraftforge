import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, map } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LibraryService } from '../../../core/services/library.service';
import { Song } from '../../../core/models/song';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from '../../../core/services/responsive.service';

type LayoutMode = 'list' | 'split' | 'detail';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
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
  private readonly responsive = inject(ResponsiveService);

  readonly lang = this.i18n.lang;
  readonly songs$ = this.library.getSongs();
  readonly isCompact$ = this.responsive.isCompact$;
  readonly layout$ = this.isCompact$.pipe(map((isCompact) => ({ isCompact })));

  importError = '';
  layoutMode: LayoutMode = 'list';
  private isCompact = false;
  private readonly routeMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  ngOnInit(): void {
    this.library
      .init()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.isCompact$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isCompact) => {
        this.isCompact = isCompact;
        if (isCompact) {
          this.layoutMode = this.isInDetailRoute() ? 'detail' : 'list';
          return;
        }
        if (this.layoutMode === 'detail') {
          this.layoutMode = 'split';
        }
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const inDetail = this.isInDetailRoute();
        if (this.isCompact) {
          this.layoutMode = inDetail ? 'detail' : 'list';
          return;
        }
        if (inDetail && this.layoutMode === 'list') {
          this.layoutMode = 'split';
        }
        if (!inDetail) {
          this.layoutMode = 'list';
        }
      });
  }

  songTitle(song: Song): string {
    const lang = this.lang();
    return song.title[lang] ?? Object.values(song.title)[0] ?? this.i18n.translate('songs.untitled', lang);
  }

  createNew(): void {
    this.importError = '';
    this.router.navigate(['/songs', 'new']);
    this.layoutMode = this.isCompact ? 'detail' : 'split';
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

  openSong(song: Song): void {
    this.router.navigate(['/songs', song.id]);
    if (this.isCompact) {
      this.layoutMode = 'detail';
      return;
    }
    this.layoutMode = 'split';
  }

  showListOnly(): void {
    this.layoutMode = 'list';
  }

  showDetailOnly(): void {
    this.layoutMode = 'detail';
  }

  showSplit(): void {
    this.layoutMode = 'split';
  }

  backToList(): void {
    this.router.navigate(['/songs']);
    this.layoutMode = 'list';
  }

  isActiveSong(song: Song): boolean {
    return this.router.isActive(`/songs/${song.id}`, this.routeMatch);
  }

  private isInDetailRoute(): boolean {
    return this.router.url.startsWith('/songs/') && this.router.url !== '/songs';
  }
}
