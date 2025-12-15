import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, take } from 'rxjs';
import { LibraryService } from './library.service';
import { LibraryPayload, SongDataService } from './song-data.service';
import { Song } from '../models/song';

const seedSongs: Song[] = [
  {
    id: 'song-001',
    title: { en: 'Seed One' },
    authorId: 'author-1',
    styleId: 'pop',
    rhythm: '4/4',
    baseKey: 'C',
    singers: ['singer-1'],
    tags: ['seed'],
    song: { sections: [] },
  },
  {
    id: 'song-002',
    title: { en: 'Seed Two' },
    authorId: 'author-2',
    styleId: 'rock',
    baseKey: 'G',
    singers: [],
    tags: [],
    song: { sections: [] },
  },
];

const payload: LibraryPayload = {
  songs: seedSongs,
  authors: [
    { id: 'author-1', name: 'Author One' },
    { id: 'author-2', name: 'Author Two' },
  ],
  singers: [
    { id: 'singer-1', name: 'Singer One' },
    { id: 'singer-2', name: 'Singer Two' },
  ],
  styles: [
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
  ],
};

describe('LibraryService', () => {
  let service: LibraryService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        LibraryService,
        {
          provide: SongDataService,
          useValue: {
            loadLibrary: jasmine.createSpy('loadLibrary').and.returnValue(of(payload)),
          },
        },
      ],
    });

    service = TestBed.inject(LibraryService);
    await firstValueFrom(service.init());
  });

  it('loads seed songs on init', async () => {
    const songs = await firstValueFrom(service.getSongs().pipe(take(1)));
    expect(songs.length).toBe(2);
    expect(songs[0].title['en']).toBe('Seed One');
  });

  it('adds a song in memory', async () => {
    const newSong: Song = {
      id: 'song-003',
      title: { en: 'New Song' },
      authorId: 'author-1',
      styleId: 'pop',
      baseKey: 'D',
      singers: [],
      tags: [],
      song: { sections: [] },
    };

    service.addSong(newSong);

    const songs = await firstValueFrom(service.getSongs().pipe(take(1)));
    expect(songs.find((song) => song.id === 'song-003')).toEqual(newSong);
  });

  it('updates a song when it exists', async () => {
    const updated: Song = { ...seedSongs[0], baseKey: 'F#' };

    service.updateSong(updated);

    const song = await firstValueFrom(service.getSongById(updated.id).pipe(take(1)));
    expect(song?.baseKey).toBe('F#');
  });

  it('throws when updating a missing song', () => {
    expect(() =>
      service.updateSong({
        id: 'missing',
        title: { en: 'Missing' },
        authorId: 'author-1',
        styleId: 'pop',
        baseKey: 'C',
        singers: [],
        song: { sections: [] },
      })
    ).toThrow();
  });

  it('deletes a song by id', async () => {
    service.deleteSong('song-001');
    const songs = await firstValueFrom(service.getSongs().pipe(take(1)));
    expect(songs.find((song) => song.id === 'song-001')).toBeUndefined();
  });

  it('exports songs as pretty JSON', () => {
    const exported = service.exportSongs();
    expect(exported).toBe(JSON.stringify(seedSongs, null, 2));
  });

  it('imports songs by replacing current list', async () => {
    const replacement: Song[] = [
      {
        id: 'song-010',
        title: { en: 'Replacement' },
        authorId: 'author-2',
        styleId: 'rock',
        baseKey: 'A',
        singers: ['singer-2'],
        song: { sections: [] },
      },
    ];

    service.importSongs(replacement);

    const songs = await firstValueFrom(service.getSongs().pipe(take(1)));
    expect(songs).toEqual(replacement);
  });
});
