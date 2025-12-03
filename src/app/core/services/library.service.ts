import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, shareReplay, take, tap } from 'rxjs';
import { SongDataService, LibraryPayload } from './song-data.service';
import { Song } from '../models/song';
import { Author } from '../models/author';
import { Singer } from '../models/singer';
import { Style } from '../models/style';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly songDataService = inject(SongDataService);
  private readonly library$ = new BehaviorSubject<LibraryPayload | null>(null);
  private initialized = false;

  init(): Observable<LibraryPayload> {
    if (this.initialized) {
      return this.library$.pipe(filter((data): data is LibraryPayload => !!data), take(1));
    }

    return this.songDataService.loadLibrary().pipe(
      tap((payload) => {
        this.library$.next(payload);
        this.initialized = true;
      }),
      shareReplay(1)
    );
  }

  private select<K extends keyof LibraryPayload>(key: K): Observable<LibraryPayload[K]> {
    return this.library$.pipe(
      filter((data): data is LibraryPayload => !!data),
      map((data) => data[key])
    );
  }

  getLibrary(): Observable<LibraryPayload> {
    return this.library$.pipe(filter((data): data is LibraryPayload => !!data));
  }

  getSongs(): Observable<Song[]> {
    return this.select('songs');
  }

  getSongById(id: string): Observable<Song | undefined> {
    return this.getSongs().pipe(map((songs) => songs.find((song) => song.id === id)));
  }

  getAuthors(): Observable<Author[]> {
    return this.select('authors');
  }

  getAuthorById(id: string): Observable<Author | undefined> {
    return this.getAuthors().pipe(map((authors) => authors.find((author) => author.id === id)));
  }

  getSingers(): Observable<Singer[]> {
    return this.select('singers');
  }

  getSingerById(id: string): Observable<Singer | undefined> {
    return this.getSingers().pipe(map((singers) => singers.find((singer) => singer.id === id)));
  }

  getStyles(): Observable<Style[]> {
    return this.select('styles');
  }

  getStyleById(id: string): Observable<Style | undefined> {
    return this.getStyles().pipe(map((styles) => styles.find((style) => style.id === id)));
  }
}
