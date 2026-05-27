import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // You can also use Subject if you don't need the initial value

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageSubject = new BehaviorSubject<string | null>(null); // Initial value is null or empty

  image$ = this.imageSubject.asObservable();

  updateImage(imageBase64: string) {
    this.imageSubject.next(imageBase64);
  }
}
