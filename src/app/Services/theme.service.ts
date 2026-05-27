import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private darkModeSubject = new BehaviorSubject<boolean>(this.mediaQuery.matches);

  constructor() {
    // Listen for OS/browser theme changes
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', (e) => this.darkModeSubject.next(e.matches));
    } else if ((this.mediaQuery as any).addListener) {
      // Safari < 14 fallback
      (this.mediaQuery as any).addListener((e: MediaQueryListEvent) => this.darkModeSubject.next(e.matches));
    }
  }

  /** Returns observable that emits true = dark, false = light */
  isDarkMode$(): Observable<boolean> {
    return this.darkModeSubject.asObservable();
  }

  /** Returns current value synchronously */
  get isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
