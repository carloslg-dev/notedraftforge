import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { Song } from '../models/song';
import { Author } from '../models/author';
import { Singer } from '../models/singer';
import { Style } from '../models/style';

export interface LibraryPayload {
  songs: Song[];
  authors: Author[];
  singers: Singer[];
  styles: Style[];
}

@Injectable({ providedIn: 'root' })
export class SongDataService {
  private readonly http = inject(HttpClient);
  private readonly basePath = 'assets/mock';

  loadLibrary(): Observable<LibraryPayload> {
    const songs$ = this.http.get<Song[]>(`${this.basePath}/songs.json`);
    const authors$ = this.http.get<Author[]>(`${this.basePath}/authors.json`);
    const singers$ = this.http.get<Singer[]>(`${this.basePath}/singers.json`);
    const styles$ = this.http.get<Style[]>(`${this.basePath}/styles.json`);

    return forkJoin({ songs: songs$, authors: authors$, singers: singers$, styles: styles$ });
  }
}
