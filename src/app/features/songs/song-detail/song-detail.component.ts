import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LibraryService } from '../../../core/services/library.service';
import { Song, SongBlock, SongSection } from '../../../core/models/song';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { StyleId } from '../../../core/models/style';

type DetailVm =
  | { song: Song; isNew: boolean; notFound: false }
  | { song: null; isNew: false; notFound: true };

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.scss'],
})
export class SongDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly library = inject(LibraryService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);
  readonly lang = this.i18n.lang;

  readonly authors$ = this.library.getAuthors();
  readonly styles$ = this.library.getStyles();
  readonly singers$ = this.library.getSingers();

  readonly form = this.fb.group({
    id: [''],
    titleEn: ['', Validators.required],
    titleEs: [''],
    authorId: ['', Validators.required],
    styleId: this.fb.control<StyleId | ''>('', { validators: Validators.required, nonNullable: true }),
    rhythm: [''],
    baseKey: ['', Validators.required],
    singers: this.fb.control<string[]>([], { nonNullable: true }),
    tags: [''],
    sections: ['', Validators.required],
  });

  readonly vm$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (!id) {
        return of<DetailVm>({ song: null, isNew: false, notFound: true });
      }
      if (id === 'new') {
        return of<DetailVm>({ song: this.createEmptySong(), isNew: true, notFound: false });
      }
      return this.library.getSongById(id).pipe(
        map((song) =>
          song
            ? ({ song, isNew: false, notFound: false } as DetailVm)
            : ({ song: null, isNew: false, notFound: true } as DetailVm)
        )
      );
    }),
    tap((vm) => this.syncForm(vm)),
    takeUntilDestroyed(this.destroyRef)
  );

  currentSong: Song | null = null;
  isNew = false;
  jsonError = '';
  mode: 'view' | 'edit' = 'view';

  songTitle(song: Song): string {
    const lang = this.lang();
    return song.title[lang] ?? Object.values(song.title)[0] ?? this.i18n.translate('songs.untitled', lang);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const sections = this.parseSections(this.form.controls.sections.value);
    if (!sections) {
      this.jsonError = this.i18n.translate('songs.sectionsInvalid', this.lang());
      return;
    }
    const song: Song = {
      ...(this.currentSong ?? this.createEmptySong()),
      id: this.form.controls.id.value || this.generateSongId(),
      title: {
        ...(this.currentSong?.title ?? {}),
        en: this.form.controls.titleEn.value ?? '',
        es: this.form.controls.titleEs.value ?? '',
      },
      authorId: this.form.controls.authorId.value ?? '',
      styleId: (this.form.controls.styleId.value || 'others') as StyleId,
      rhythm: this.form.controls.rhythm.value ?? undefined,
      baseKey: this.form.controls.baseKey.value ?? '',
      singers: this.form.controls.singers.value ?? [],
      tags: this.splitList(this.form.controls.tags.value),
      song: { sections },
    };

    if (this.isNew) {
      this.library.addSong(song);
      this.router.navigate(['/songs', song.id]);
    } else {
      this.library.updateSong(song);
    }
    this.currentSong = song;
    this.isNew = false;
    this.jsonError = '';
    this.mode = 'view';
  }

  deleteSong(): void {
    const id = this.form.controls.id.value;
    if (!id) {
      return;
    }
    this.library.deleteSong(id);
    this.router.navigate(['/songs']);
  }

  cancel(): void {
    if (this.isNew) {
      this.router.navigate(['/songs']);
      return;
    }
    if (this.currentSong) {
      this.syncForm({ song: this.currentSong, isNew: false, notFound: false });
    }
    this.mode = 'view';
  }

  startNew(): void {
    this.router.navigate(['/songs', 'new']);
  }

  enterEdit(): void {
    if (this.mode === 'view') {
      this.mode = 'edit';
    }
  }

  blockLyrics(block: SongBlock): string {
    const lang = this.lang();
    return block.lyrics[lang] ?? Object.values(block.lyrics)[0] ?? '';
  }

  hasChordChange(block: SongBlock, previous?: SongBlock): boolean {
    return !!block.chord && block.chord !== previous?.chord;
  }

  private syncForm(vm: DetailVm): void {
    this.isNew = vm.isNew;
    if (!vm.song) {
      this.currentSong = null;
      this.form.reset();
      return;
    }
    this.currentSong = vm.song;
    this.form.reset({
      id: vm.song.id,
      titleEn: vm.song.title['en'] ?? '',
      titleEs: vm.song.title['es'] ?? '',
      authorId: vm.song.authorId,
      styleId: vm.song.styleId,
      rhythm: vm.song.rhythm ?? '',
      baseKey: vm.song.baseKey,
      singers: vm.song.singers,
      tags: (vm.song.tags ?? []).join(', '),
      sections: JSON.stringify(vm.song.song.sections, null, 2),
    });
    this.jsonError = '';
    this.mode = vm.isNew ? 'edit' : 'view';
  }

  private parseSections(raw: string | null): SongSection[] | null {
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? (parsed as SongSection[]) : null;
    } catch {
      return null;
    }
  }

  private splitList(value: string | null): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private createEmptySong(): Song {
    return {
      id: this.generateSongId(),
      title: { en: '', es: '' },
      authorId: '',
      styleId: 'others',
      rhythm: '',
      baseKey: 'C',
      singers: [],
      tags: [],
      song: {
        sections: [
          {
            name: 'Intro',
            lines: [
              {
                blocks: [
                  {
                    lyrics: { en: '' },
                  },
                ],
              },
            ],
          },
        ],
      },
    };
  }

  private generateSongId(): string {
    return `song-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }
}
