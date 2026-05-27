import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({ providedIn: 'root' })
export class UserService {
  private userDataSubject = new BehaviorSubject<any | null>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(private api: ApiService) {}

  getUserData(userId: string): void {
    if (!this.userDataSubject.value) {
      this.api.getUserData(0, 0, '', '', ` AND ID =${userId}`).subscribe({
        next: (res: any) => {
          if (res?.code === 200 && res?.data?.length > 0) {
            this.userDataSubject.next(res.data[0]);
          } else {
            this.userDataSubject.next(null);
          }
        },
        error: (err) => {
          console.error('User data fetch failed', err);
          this.userDataSubject.next(null);
        },
      });
    }
  }

  clearCache() {
    this.userDataSubject.next(null); // Call this on logout or force refresh
  }
}
