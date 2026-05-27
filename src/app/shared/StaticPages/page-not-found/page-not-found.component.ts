import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
