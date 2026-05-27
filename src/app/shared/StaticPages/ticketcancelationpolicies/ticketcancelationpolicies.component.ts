import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-ticketcancelationpolicies',
  templateUrl: './ticketcancelationpolicies.component.html',
  styleUrls: ['./ticketcancelationpolicies.component.scss']
})
export class TicketcancelationpoliciesComponent {
  constructor(
    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Ticket Cancellation Policies');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}
