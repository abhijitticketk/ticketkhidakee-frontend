import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor() { }

  //  private selectedCategorySubject = new BehaviorSubject<string | null>(null);
  // selectedCategory$ = this.selectedCategorySubject.asObservable();

  // setSelectedCategory(category: string) {
  //   this.selectedCategorySubject.next(category);
  // }

   private selectedCategorySubject = new BehaviorSubject<string | null>(
    localStorage.getItem('selectedCategory')
  );
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  setSelectedCategory(category: any) {
    localStorage.setItem('selectedCategory', category); // Save to localStorage
    this.selectedCategorySubject.next(category);
  }
}
