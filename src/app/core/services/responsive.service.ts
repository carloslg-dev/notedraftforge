import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs';

export const DEVICE_KIND = {
  Handset: 'handset',
  Tablet: 'tablet',
  Web: 'web',
} as const;

export type DeviceKind = typeof DEVICE_KIND[keyof typeof DEVICE_KIND];

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  readonly device$ = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web, Breakpoints.WebLandscape])
    .pipe(
      map((r) => {
        if (r.breakpoints[Breakpoints.Handset]) {
          return DEVICE_KIND.Handset;
        } else if (r.breakpoints[Breakpoints.Tablet]) {
          return DEVICE_KIND.Tablet;
        } else {
          return DEVICE_KIND.Web;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  readonly isHandset$ = this.device$.pipe(map((d) => d === DEVICE_KIND.Handset));
  readonly isTablet$ = this.device$.pipe(map((d) => d === DEVICE_KIND.Tablet));
  readonly isWeb$ = this.device$.pipe(map((d) => d === DEVICE_KIND.Web));
}

