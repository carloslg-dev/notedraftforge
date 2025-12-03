import { Routes } from '@angular/router';
import { SongListComponent } from './features/songs/song-list/song-list.component';
import { SongDetailComponent } from './features/songs/song-detail/song-detail.component';
import { SnapshotBuilderComponent } from './features/snapshots/snapshot-builder/snapshot-builder.component';

export const appRoutes: Routes = [
  {
    path: 'songs',
    component: SongListComponent,
    children: [{ path: ':id', component: SongDetailComponent }],
  },
  {
    path: 'snapshots',
    component: SnapshotBuilderComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'songs' },
  { path: '**', redirectTo: 'songs' },
];
