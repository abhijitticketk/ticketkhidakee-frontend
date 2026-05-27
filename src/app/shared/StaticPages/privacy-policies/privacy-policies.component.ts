import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policies',
  templateUrl: './privacy-policies.component.html',
  styleUrls: ['./privacy-policies.component.scss']
})
export class PrivacyPoliciesComponent {
  constructor(
    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Privacy Policies');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}
