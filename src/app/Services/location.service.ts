import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
  private selectedCitySubject = new BehaviorSubject<string | null>(null);
  selectedCity$ = this.selectedCitySubject.asObservable();

  setSelectedCity(cityName: string) {
    this.selectedCitySubject.next(cityName);
  }
}
