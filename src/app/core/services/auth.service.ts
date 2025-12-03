import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user$ = new BehaviorSubject<User | null>(null);

  constructor() {
    if (!environment.production) {
      this.loginWith('local-dev');
    }
  }

  get currentUser$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  loginWith(provider: string): void {
    const fakeUser: User = {
      id: 'dev-user',
      name: 'Dev User',
      provider,
    };
    this.user$.next(fakeUser);
  }

  logout(): void {
    this.user$.next(null);
  }
}
