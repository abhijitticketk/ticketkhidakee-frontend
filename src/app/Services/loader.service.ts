import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading.asObservable();

  private timeoutId: any;

  show(timeout: number = 1000) { // default 10 seconds
    clearTimeout(this.timeoutId);
    // setTimeout(() => this.loading.next(true), 0); // async safe trigger
    this.loading.next(true); // ✅ Show immediately, no delay


    // Auto-hide after timeout
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, timeout);
  }

  // hide() {
  //   clearTimeout(this.timeoutId); // Cancel auto-hide if manually hidden
  //   setTimeout(() => this.loading.next(false), 0); // async safe
  // }

  hide() {
    clearTimeout(this.timeoutId);
    setTimeout(() => {
      this.loading.next(false);
    }, 200); // allow animation time
  }
  
}
