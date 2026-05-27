import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-razorpaypolicies',
  templateUrl: './razorpaypolicies.component.html',
  styleUrls: ['./razorpaypolicies.component.scss']
})
export class RazorpaypoliciesComponent {
  constructor(
    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Razorpay Policies');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}
